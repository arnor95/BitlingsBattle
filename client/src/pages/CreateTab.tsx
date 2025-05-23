import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { generateBitlingImage, generateBitlingStats } from "@/lib/openai";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { BitlingType } from "@shared/schema";

interface CreateTabProps {
  className?: string;
}

interface BitlingStats {
  hp: number;
  attack: number;
  defense: number;
  speed: number;
}

interface BitlingMove {
  name: string;
  type: BitlingType;
  power: number;
  pp: number;
  maxPp: number;
  description: string;
  accuracy: number;
  levelLearned: number;
  category: "physical" | "special" | "status";
}

interface BitlingFormData {
  name: string;
  prompt: string;
  creatorHandle: string;
  imageUrl?: string;
  types?: BitlingType[];
  stats?: BitlingStats;
  moves?: BitlingMove[];
  description?: string;
  behavior?: string;
}

export default function CreateTab({ className = "" }: CreateTabProps) {
  const { toast } = useToast();
  const [bitling, setBitling] = useState<BitlingFormData>({
    name: "",
    prompt: "",
    creatorHandle: "",
  });
  const [isGenerating, setIsGenerating] = useState(false);

  const submitBitlingMutation = useMutation({
    mutationFn: async (data: BitlingFormData) => {
      const { types, stats, moves, description, behavior, ...basicData } = data;
      
      // Submit both basic data and the AI-generated details
      return await apiRequest("POST", "/api/bitlings", {
        ...basicData,
        types,
        stats,
        moves,
        description,
        behavior
      });
    },
    onSuccess: () => {
      toast({
        title: "Bitling Submitted!",
        description: "Your Bitling has been submitted for voting.",
      });
      // Reset form after successful submission
      setBitling({
        name: "",
        prompt: "",
        creatorHandle: "",
        imageUrl: undefined,
      });
    },
    onError: (error) => {
      toast({
        title: "Submission Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setBitling((prev) => ({ ...prev, [name]: value }));
  };

  const [isGeneratingStats, setIsGeneratingStats] = useState(false);
  
  const handleGenerateBitling = async () => {
    if (!bitling.prompt) {
      toast({
        title: "Prompt Required",
        description: "Please provide a description for your Bitling.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsGenerating(true);
      // Step 1: Generate the Bitling image
      const imageData = await generateBitlingImage(bitling.prompt);
      
      if (imageData) {
        setBitling((prev) => ({ 
          ...prev, 
          imageUrl: imageData.url 
        }));
        
        toast({
          title: "Bitling Image Generated!",
          description: "Now generating types, stats, and abilities...",
        });
        
        // Step 2: Generate the Bitling stats, types and moves
        setIsGeneratingStats(true);
        const statsData = await generateBitlingStats(
          imageData.url,
          bitling.name || "Unnamed Bitling",
          bitling.prompt
        );
        
        if (statsData) {
          // Update the bitling with the generated data
          setBitling((prev) => ({ 
            ...prev, 
            types: statsData.types,
            stats: statsData.stats,
            moves: statsData.moves,
            description: statsData.description,
            behavior: statsData.behavior
          }));
          
          toast({
            title: "Bitling Complete!",
            description: `Created a ${statsData.types[0]} type Bitling with unique abilities!`,
          });
        }
      }
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate Bitling",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
      setIsGeneratingStats(false);
    }
  };

  const handleSubmitBitling = () => {
    if (!bitling.name) {
      toast({
        title: "Name Required",
        description: "Please give your Bitling a name.",
        variant: "destructive",
      });
      return;
    }

    if (!bitling.prompt) {
      toast({
        title: "Description Required",
        description: "Please provide a description for your Bitling.",
        variant: "destructive",
      });
      return;
    }

    if (!bitling.imageUrl) {
      toast({
        title: "Image Required",
        description: "Please generate an image for your Bitling first.",
        variant: "destructive",
      });
      return;
    }

    submitBitlingMutation.mutate(bitling);
  };

  const showPromptTips = () => {
    toast({
      title: "Prompt Tips",
      description: "Be specific about colors, features, and personality. Mention elemental types like fire or water.",
      duration: 5000,
    });
  };

  return (
    <div className={`tab-pane ${className}`}>
      <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
        <h2 className="font-pixel text-lg text-primary mb-4">CREATE YOUR BITLING</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Bitling Generator Form */}
          <div>
            <div className="mb-4">
              <label className="block font-pixel text-sm text-gray-dark mb-2">BITLING NAME</label>
              <Input
                name="name"
                value={bitling.name}
                onChange={handleInputChange}
                placeholder="Enter a name for your Bitling"
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg font-sans"
              />
            </div>
            
            <div className="mb-4">
              <label className="block font-pixel text-sm text-gray-dark mb-2">DESCRIPTION PROMPT</label>
              <div className="relative">
                <Textarea
                  name="prompt"
                  value={bitling.prompt}
                  onChange={handleInputChange}
                  placeholder="Describe your Bitling... (e.g., A small fire fox with glowing tail and ruby eyes)"
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg font-sans h-32"
                />
                <div className="absolute right-2 bottom-2">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={showPromptTips}
                    className="bg-secondary text-white rounded-lg hover:bg-opacity-90"
                  >
                    <i className="ri-question-line mr-1"></i> Tips
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block font-pixel text-sm text-gray-dark mb-2">CREATOR HANDLE (OPTIONAL)</label>
              <div className="flex">
                <div className="bg-gray-200 flex items-center px-3 rounded-l-lg">@</div>
                <Input
                  name="creatorHandle"
                  value={bitling.creatorHandle}
                  onChange={handleInputChange}
                  placeholder="Your Twitter/X username"
                  className="flex-1 px-3 py-2 border-2 border-gray-300 rounded-r-lg font-sans"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={handleGenerateBitling}
                disabled={isGenerating || !bitling.prompt}
                className="bg-secondary text-white font-pixel py-3 px-4 rounded-lg hover:bg-opacity-90 transition flex items-center justify-center"
              >
                {isGenerating ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    GENERATING...
                  </>
                ) : (
                  <>
                    <i className="ri-magic-line mr-2"></i> GENERATE
                  </>
                )}
              </Button>
              <Button
                onClick={handleSubmitBitling}
                disabled={submitBitlingMutation.isPending || !bitling.imageUrl}
                className="bg-primary text-white font-pixel py-3 px-4 rounded-lg hover:bg-opacity-90 transition flex items-center justify-center"
              >
                {submitBitlingMutation.isPending ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    SUBMITTING...
                  </>
                ) : (
                  <>
                    <i className="ri-send-plane-line mr-2"></i> SUBMIT
                  </>
                )}
              </Button>
            </div>
          </div>
          
          {/* Preview Area */}
          <div className="bg-gray-100 rounded-lg p-4 flex flex-col items-center justify-center">
            <h3 className="font-pixel text-sm mb-4">PREVIEW</h3>
            
            <div className="bg-white rounded-lg shadow-lg p-4 w-full max-w-xs">
              <div className="h-48 bg-gray-200 rounded-lg flex items-center justify-center mb-3 overflow-hidden relative" id="bitling-preview">
                {bitling.imageUrl ? (
                  <img 
                    src={bitling.imageUrl} 
                    alt="Generated Bitling" 
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <div className="text-gray-500 text-center px-4">
                    <i className="ri-image-line text-4xl"></i>
                    <p className="text-sm mt-2">Your Bitling will appear here</p>
                  </div>
                )}
              </div>
              
              <div className="bg-gray-100 rounded-lg p-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-pixel text-sm">{bitling.name || "UNNAMED"}</span>
                  <span className="text-xs text-gray-500">
                    {bitling.creatorHandle ? `@${bitling.creatorHandle}` : "@creator"}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1 mb-2">
                  {bitling.types && bitling.types.length > 0 ? (
                    bitling.types.map((type, index) => (
                      <span 
                        key={index}
                        className={`inline-block px-2 py-1 bg-${type.toLowerCase()} text-white rounded-full text-xs font-medium`}
                      >
                        {type.toUpperCase()}
                      </span>
                    ))
                  ) : (
                    <span className="inline-block px-2 py-1 bg-gray-200 rounded-full text-xs font-medium text-gray-800">
                      No Type Yet
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-700">
                  {bitling.prompt || "No description yet..."}
                </p>
              </div>
            </div>
            
            {bitling.imageUrl && (
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600 mb-2">Not happy with the result?</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleGenerateBitling}
                  disabled={isGenerating}
                  className="bg-gray-300 text-gray-800 font-pixel text-xs py-2 px-3 rounded-lg hover:bg-gray-400 transition"
                >
                  TRY AGAIN
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Tips for Good Bitlings */}
      <div className="bg-white rounded-xl shadow-lg p-4">
        <h2 className="font-pixel text-lg text-primary mb-4">TIPS FOR GREAT BITLINGS</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-fire bg-opacity-10 p-3 rounded-lg">
            <h3 className="font-pixel text-sm text-fire mb-2">BE SPECIFIC</h3>
            <p className="text-sm">Include details about color, size, features, and theme. The more specific, the better!</p>
          </div>
          
          <div className="bg-water bg-opacity-10 p-3 rounded-lg">
            <h3 className="font-pixel text-sm text-water mb-2">ADD PERSONALITY</h3>
            <p className="text-sm">Describe if your Bitling is friendly, fierce, mischievous, or playful.</p>
          </div>
          
          <div className="bg-electric bg-opacity-10 p-3 rounded-lg">
            <h3 className="font-pixel text-sm text-electric mb-2">THINK ABOUT TYPE</h3>
            <p className="text-sm">Consider what elemental type your Bitling might be (fire, water, grass, etc.).</p>
          </div>
          
          <div className="bg-grass bg-opacity-10 p-3 rounded-lg">
            <h3 className="font-pixel text-sm text-grass mb-2">AVOID COPYCATS</h3>
            <p className="text-sm">Be original! Exact copies of existing creatures may be rejected.</p>
          </div>
          
          <div className="bg-psychic bg-opacity-10 p-3 rounded-lg">
            <h3 className="font-pixel text-sm text-psychic mb-2">SPECIAL FEATURES</h3>
            <p className="text-sm">Give your Bitling unique traits like glowing eyes, crystal fur, or magical patterns.</p>
          </div>
          
          <div className="bg-ghost bg-opacity-10 p-3 rounded-lg">
            <h3 className="font-pixel text-sm text-ghost mb-2">KEEP IT FRIENDLY</h3>
            <p className="text-sm">Bitlings should be appropriate for all ages. No scary or inappropriate content.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
