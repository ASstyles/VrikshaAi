'use client';
import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from '@/components/ui/label';
import { identifyPlantFromPhoto, PlantIdentificationOutput } from '@/ai/flows/plant-identification';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Leaf, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function PlantIdentifierPage() {
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<Omit<PlantIdentificationOutput, 'error'> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 100 * 1024 * 1024) { // 100MB limit
        toast({
          variant: 'destructive',
          title: 'Image too large',
          description: 'Please upload an image smaller than 100MB.',
        });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
        setResult(null); // Clear previous result
      };
      reader.readAsDataURL(file);
    }
  };


  async function handleIdentify() {
    if (!preview) {
        toast({
            variant: "destructive",
            title: "No photo uploaded",
            description: "Please upload a photo of a plant to identify.",
        });
        return;
    }
    
    setIsLoading(true);
    setResult(null);

    try {
      const input = {
          photoDataUri: preview,
      };

      const response = await identifyPlantFromPhoto(input);
      if (response.error) {
        throw new Error(response.error);
      }
      setResult(response);
    } catch (error: any) {
      console.error('Error identifying plant:', error);
      toast({
        variant: 'destructive',
        title: 'Identification Failed',
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Plant Identifier</CardTitle>
        <CardDescription>Upload a photo to identify a plant and learn its uses.</CardDescription>
      </CardHeader>
      <CardContent className="grid md:grid-cols-2 gap-8">
        <div className="space-y-4">
            <div className="space-y-2">
                <Label>Plant Photo</Label>
                <div className="relative w-full aspect-video border-2 border-dashed rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                    {preview ? (
                        <Image src={preview} alt="Plant preview" fill className="object-cover" />
                    ) : (
                        <div className="text-center text-muted-foreground p-4">
                            <Upload className="mx-auto h-10 w-10 mb-2"/>
                            <p className="font-semibold">Click to upload or drag and drop</p>
                            <p className="text-xs">PNG, JPG, or JPEG (Max 100MB)</p>
                        </div>
                    )}
                     <Input
                        id="photo-upload"
                        type="file"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        accept="image/png, image/jpeg, image/jpg"
                        onChange={handleImageUpload}
                        disabled={isLoading}
                    />
                </div>
            </div>

            <Button onClick={handleIdentify} disabled={isLoading || !preview} className="w-full">
                {isLoading ? 'Identifying...' : 'Identify Plant'}
            </Button>
        </div>
        <div className="flex items-center justify-center">
            {isLoading && (
                 <div className="flex flex-col items-center gap-4 text-muted-foreground">
                    <Leaf className="h-16 w-16 animate-spin text-primary" />
                    <p>Analyzing image...</p>
                </div>
            )}
            {result && (
                <Alert>
                    <AlertTitle className="font-headline text-2xl mb-2">{result.plantName}</AlertTitle>
                    <AlertDescription>{result.keyUses}</AlertDescription>
                </Alert>
            )}
            {!isLoading && !result && (
                <div className="text-center text-muted-foreground p-8 border-dashed border-2 rounded-lg h-full flex flex-col justify-center">
                    <p>Identification results will appear here.</p>
                </div>
            )}
        </div>
      </CardContent>
    </Card>
  );
}
