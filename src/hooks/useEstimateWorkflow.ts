import { useState } from "react";

export type EstimateStep = 1 | 2 | 3 | 4 | 5;

interface WorkflowStep {
  id: EstimateStep;
  title: string;
  description: string;
  isComplete: boolean;
}

export const useEstimateWorkflow = () => {
  const [currentStep, setCurrentStep] = useState<EstimateStep>(1);
  
  const steps: WorkflowStep[] = [
    {
      id: 1,
      title: "Basic Info",
      description: "Customer & estimate details",
      isComplete: false,
    },
    {
      id: 2,
      title: "Specifications",
      description: "Jewelry details & weights",
      isComplete: false,
    },
    {
      id: 3,
      title: "Additional Costs",
      description: "CAD, camming & GST",
      isComplete: false,
    },
    {
      id: 4,
      title: "Pricing",
      description: "Profit margin & final price",
      isComplete: false,
    },
    {
      id: 5,
      title: "Review & Save",
      description: "Export or generate invoice",
      isComplete: false,
    },
  ];

  const goToNextStep = () => {
    if (currentStep < 5) {
      setCurrentStep((prev) => (prev + 1) as EstimateStep);
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as EstimateStep);
    }
  };

  const goToStep = (step: EstimateStep) => {
    setCurrentStep(step);
  };

  const validateStep = (step: EstimateStep): { isValid: boolean; message?: string } => {
    switch (step) {
      case 1:
        // Basic info validation would go here
        return { isValid: true };
      case 2:
        // Jewelry specs validation would go here
        return { isValid: true };
      case 3:
        // Additional costs validation would go here
        return { isValid: true };
      case 4:
        // Pricing validation would go here
        return { isValid: true };
      case 5:
        // Final review validation would go here
        return { isValid: true };
      default:
        return { isValid: false };
    }
  };

  return {
    currentStep,
    steps,
    goToNextStep,
    goToPreviousStep,
    goToStep,
    validateStep,
    isFirstStep: currentStep === 1,
    isLastStep: currentStep === 5,
  };
};