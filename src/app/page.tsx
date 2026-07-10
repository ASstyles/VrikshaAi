import { Button } from '@/components/ui/button';
import placeholderData from '@/lib/placeholder-images.json';
import { ArrowRight, Bot, Leaf, Scan, Sparkles, TestTube } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  const { placeholderImages: PlaceHolderImages } = placeholderData;
  const heroImage = PlaceHolderImages.find((img) => img.id === 'hero-background');

  const features = [
    {
      icon: TestTube,
      title: 'Prakriti Analyzer',
      description: 'Discover your unique mind-body constitution with our detailed quiz.',
    },
    {
      icon: Leaf,
      title: 'Digital Herbarium',
      description: 'Explore a rich database of medicinal plants and their benefits.',
    },
    {
      icon: Scan,
      title: 'Plant Identification',
      description: 'Instantly identify plants around you using your camera.',
    },
    {
      icon: Sparkles,
      title: 'Personalized Wellness',
      description: 'Get AI-powered recommendations for plants and daily tips.',
    },
    {
      icon: Bot,
      title: 'AyurBot',
      description: 'Chat with our AI assistant for any Ayurvedic queries.',
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <header className="container mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Leaf className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold font-headline text-foreground">
            VrikshaAi
          </h1>
        </div>
        <nav>
          <Button asChild>
            <Link href="/login">
              Go to App <ArrowRight className="ml-2" />
            </Link>
          </Button>
        </nav>
      </header>

      <main className="flex-grow">
        <section className="relative py-20 md:py-32">
          {heroImage && (
            <Image
              src={heroImage.imageUrl}
              alt={heroImage.description}
              fill
              className="object-cover"
              priority
              data-ai-hint={heroImage.imageHint}
            />
          )}
          <div className="absolute inset-0 bg-background/70 backdrop-blur-sm"></div>
          <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl md:text-6xl font-headline font-bold text-foreground">
              Rediscover Wellness, Naturally.
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-lg md:text-xl text-foreground/80">
              VrikshaAi bridges ancient Ayurvedic wisdom with modern technology to guide you on a personalized journey to health and harmony.
            </p>
            <div className="mt-8">
              <Button size="lg" asChild>
                <Link href="/prakriti-test">
                  Discover Your Prakriti <ArrowRight className="ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24 bg-background/50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h3 className="text-3xl md:text-4xl font-headline font-bold text-foreground">
                Your Personal Guide to Ayurveda
              </h3>
              <p className="mt-3 max-w-xl mx-auto text-md text-foreground/70">
                Unlock a balanced life with our suite of intelligent, personalized tools.
              </p>
            </div>
            <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, index) => (
                <div key={index} className="p-6 rounded-lg bg-card border">
                  <feature.icon className="h-10 w-10 text-primary" />
                  <h4 className="mt-4 text-xl font-headline font-semibold">
                    {feature.title}
                  </h4>
                  <p className="mt-2 text-foreground/80">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-secondary/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-muted-foreground text-sm">
          <p>&copy; 2026 VrikshaAi. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
