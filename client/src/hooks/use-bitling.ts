import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { generateBitlingImage } from '@/lib/openai';
import { Bitling } from '@shared/schema';

interface BitlingFormData {
  name: string;
  prompt: string;
  creatorHandle: string;
  imageUrl?: string;
}

export function useBitling() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);

  // Generate Bitling image using OpenAI
  const generateImage = async (prompt: string): Promise<string | null> => {
    if (!prompt) {
      toast({
        title: "Empty Prompt",
        description: "Please provide a description for your Bitling.",
        variant: "destructive",
      });
      return null;
    }

    try {
      setIsGenerating(true);
      const result = await generateBitlingImage(prompt);
      
      if (result && result.url) {
        toast({
          title: "Bitling Generated!",
          description: "Your Bitling image has been created successfully.",
        });
        return result.url;
      }

      throw new Error("Failed to generate image");
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate Bitling image",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  // Submit Bitling mutation
  const submitBitlingMutation = useMutation({
    mutationFn: async (data: BitlingFormData) => {
      return await apiRequest("POST", "/api/bitlings", data);
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Your Bitling has been submitted for voting.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/bitlings'] });
    },
    onError: (error) => {
      toast({
        title: "Submission Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Vote mutation
  const voteMutation = useMutation({
    mutationFn: async ({ bitlingId, vote }: { bitlingId: string; vote: 1 | -1 }) => {
      return await apiRequest("POST", "/api/vote", { bitlingId, vote });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bitlings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/bitlings/leaderboard'] });
    },
    onError: (error) => {
      toast({
        title: "Vote Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Generate stats mutation
  const generateStatsMutation = useMutation({
    mutationFn: async (bitlingId: string) => {
      return await apiRequest("POST", `/api/bitlings/${bitlingId}/generate-stats`, {});
    },
    onSuccess: (_, bitlingId) => {
      toast({
        title: "Stats Generated!",
        description: "Bitling stats and abilities have been generated.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/bitlings', bitlingId] });
    },
    onError: (error) => {
      toast({
        title: "Failed to Generate Stats",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    isGenerating,
    generateImage,
    submitBitling: submitBitlingMutation.mutate,
    isSubmitting: submitBitlingMutation.isPending,
    voteBitling: voteMutation.mutate,
    isVoting: voteMutation.isPending,
    generateStats: generateStatsMutation.mutate,
    isGeneratingStats: generateStatsMutation.isPending,
  };
}
