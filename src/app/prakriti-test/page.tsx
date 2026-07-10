
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PRAKRITI_QUESTIONS } from '@/lib/prakriti-questions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { usePrakriti } from '@/hooks/use-prakriti';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useUser, useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';

type Dosha = 'vata' | 'pitta' | 'kapha';

export default function PrakritiTestPage() {
  const router = useRouter();
  const { setResults, clearResults } = usePrakriti();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [scores, setScores] = useState({ vata: 0, pitta: 0, kapha: 0 });
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const currentQuestion = PRAKRITI_QUESTIONS[currentQuestionIndex];
  const progress = ((currentQuestionIndex) / PRAKRITI_QUESTIONS.length) * 100;

  const handleAnswer = (dosha: Dosha) => {
    const newScores = { ...scores, [dosha]: scores[dosha] + 1 };
    setScores(newScores);

    if (currentQuestionIndex < PRAKRITI_QUESTIONS.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      calculateAndSaveResults(newScores);
    }
  };
  
  const calculateAndSaveResults = (finalScores: typeof scores) => {
    const total = Object.values(finalScores).reduce((sum, score) => sum + score, 0);
    const percentages = {
      vata: Math.round((finalScores.vata / total) * 100),
      pitta: Math.round((finalScores.pitta / total) * 100),
      kapha: Math.round((finalScores.kapha / total) * 100),
    };

    const sortedDoshas = Object.entries(percentages).sort(([, a], [, b]) => b - a);
    
    let constitution = sortedDoshas[0][0];
    if (sortedDoshas[1][1] > 30) { // Bi-doshic
        constitution = `${sortedDoshas[0][0]}-${sortedDoshas[1][0]}`;
    }
    if(sortedDoshas[0][1] - sortedDoshas[2][1] < 10) { // Tri-doshic
        constitution = 'vata-pitta-kapha';
    }

    const resultsToSave = { ...percentages, constitution: constitution.charAt(0).toUpperCase() + constitution.slice(1) };
    setResults(resultsToSave);

    if (user) {
      const userProfileRef = doc(firestore, 'users', user.uid);
      const profileData = {
        vataScore: resultsToSave.vata,
        pittaScore: resultsToSave.pitta,
        kaphaScore: resultsToSave.kapha,
        dominantDosha: resultsToSave.constitution,
        id: user.uid,
      }
      setDocumentNonBlocking(userProfileRef, profileData, { merge: true });
       toast({
        title: "Prakriti Test Completed!",
        description: "Your results have been saved to your profile.",
      });
    }

    router.push('/dashboard');
  };

  return (
    <div className="flex items-center justify-center w-full min-h-full">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <Progress value={progress} className="mb-4" />
          <CardTitle className="font-headline text-2xl">{currentQuestion.category}</CardTitle>
          <CardDescription>Question {currentQuestionIndex + 1} of {PRAKRITI_QUESTIONS.length}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-lg font-semibold mb-6">{currentQuestion.question}</p>
          <RadioGroup className="space-y-4">
            {currentQuestion.options.map((option, index) => (
              <div key={index} className="flex items-center space-x-3">
                  <RadioGroupItem value={option.text} id={`q${currentQuestionIndex}-o${index}`} onClick={() => handleAnswer(option.dosha as Dosha)} />
                  <Label htmlFor={`q${currentQuestionIndex}-o${index}`} className="flex-1 cursor-pointer">
                    {option.text}
                  </Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
         <CardFooter className="flex justify-between">
            <p className="text-sm text-muted-foreground">Choose the option that best describes you.</p>
        </CardFooter>
      </Card>
    </div>
  );
}
