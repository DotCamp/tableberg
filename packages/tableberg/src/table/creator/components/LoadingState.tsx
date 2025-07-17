import { Spinner } from "@wordpress/components";
import { __ } from "@wordpress/i18n";
import { useState, useEffect } from "react";

interface Props {
    message?: string;
    method?: "prompt" | "content" | "image";
}

interface LoadingStep {
    id: string;
    label: string;
    icon: string;
    description: string;
    estimatedTime?: number;
}

const getStepsForMethod = (method: "prompt" | "content" | "image" | undefined): LoadingStep[] => {
    const commonSteps: LoadingStep[] = [
        {
            id: "analyze",
            label: __("Analyzing Request", "tableberg"),
            icon: "🔍",
            description: __("Understanding your requirements", "tableberg"),
            estimatedTime: 2000
        },
        {
            id: "structure",
            label: __("Designing Structure", "tableberg"),
            icon: "🏗️",
            description: __("Creating table layout and columns", "tableberg"),
            estimatedTime: 3000
        },
        {
            id: "content",
            label: __("Generating Content", "tableberg"),
            icon: "✨",
            description: __("Filling table with relevant data", "tableberg"),
            estimatedTime: 4000
        },
        {
            id: "blocks",
            label: __("Creating Blocks", "tableberg"),
            icon: "🧩",
            description: __("Converting to WordPress blocks", "tableberg"),
            estimatedTime: 2000
        }
    ];

    if (method === "content") {
        return [
            {
                id: "extract",
                label: __("Extracting Content", "tableberg"),
                icon: "📄",
                description: __("Reading and processing page content", "tableberg"),
                estimatedTime: 1500
            },
            ...commonSteps
        ];
    }

    if (method === "image") {
        return [
            {
                id: "upload",
                label: __("Processing Image", "tableberg"),
                icon: "🖼️",
                description: __("Analyzing uploaded image", "tableberg"),
                estimatedTime: 2000
            },
            ...commonSteps
        ];
    }

    return commonSteps;
};

const motivationalMessages = [
    __("Creating something amazing for you...", "tableberg"),
    __("Crafting the perfect table...", "tableberg"),
    __("Almost there, just a few more seconds...", "tableberg"),
    __("Putting the finishing touches...", "tableberg"),
    __("Your table is taking shape...", "tableberg")
];

const tips = [
    __("💡 Tip: You can customize your table after it's created", "tableberg"),
    __("💡 Tip: Use the table settings to change colors and styling", "tableberg"),
    __("💡 Tip: Add more rows and columns as needed", "tableberg"),
    __("💡 Tip: Images and buttons can be added to any cell", "tableberg"),
    __("💡 Tip: Star ratings help showcase product quality", "tableberg")
];

export default function LoadingState({ message = __("Creating your table...", "tableberg"), method }: Props) {
    const [currentStep, setCurrentStep] = useState(0);
    const [progress, setProgress] = useState(0);
    const [currentTip, setCurrentTip] = useState(0);
    const [motivationalMessage, setMotivationalMessage] = useState(0);
    const [elapsedTime, setElapsedTime] = useState(0);
    
    const steps = getStepsForMethod(method);
    const totalEstimatedTime = steps.reduce((sum, step) => sum + (step.estimatedTime || 3000), 0);
    
    useEffect(() => {
        const interval = setInterval(() => {
            setElapsedTime(prev => prev + 100);
        }, 100);
        
        return () => clearInterval(interval);
    }, []);
    
    useEffect(() => {
        let accumulatedTime = 0;
        let currentStepIndex = 0;
        
        for (let i = 0; i < steps.length; i++) {
            accumulatedTime += steps[i].estimatedTime || 3000;
            if (elapsedTime < accumulatedTime) {
                currentStepIndex = i;
                break;
            }
        }
        
        setCurrentStep(currentStepIndex);
        setProgress(Math.min((elapsedTime / totalEstimatedTime) * 100, 95));
    }, [elapsedTime, steps, totalEstimatedTime]);
    
    useEffect(() => {
        const tipInterval = setInterval(() => {
            setCurrentTip(prev => (prev + 1) % tips.length);
        }, 4000);
        
        return () => clearInterval(tipInterval);
    }, []);
    
    useEffect(() => {
        const messageInterval = setInterval(() => {
            setMotivationalMessage(prev => (prev + 1) % motivationalMessages.length);
        }, 3000);
        
        return () => clearInterval(messageInterval);
    }, []);
    
    return (
        <div className="tableberg-ai-loading">
            <div className="tableberg-ai-loading-animation">
                <Spinner />
                <div className="tableberg-ai-loading-pulse"></div>
            </div>
            
            <div className="tableberg-ai-loading-header">
                <h3>{message}</h3>
                <p className="tableberg-ai-loading-motivational">
                    {motivationalMessages[motivationalMessage]}
                </p>
            </div>
            
            <div className="tableberg-ai-loading-progress">
                <div className="tableberg-ai-loading-progress-bar">
                    <div 
                        className="tableberg-ai-loading-progress-fill"
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
                <div className="tableberg-ai-loading-progress-text">
                    {Math.round(progress)}% {__("Complete", "tableberg")}
                </div>
            </div>
            
            <div className="tableberg-ai-loading-steps">
                {steps.map((step, index) => (
                    <div 
                        key={step.id}
                        className={`tableberg-ai-loading-step ${
                            index < currentStep ? 'completed' : 
                            index === currentStep ? 'active' : 'pending'
                        }`}
                    >
                        <div className="tableberg-ai-loading-step-icon">
                            {index < currentStep ? '✅' : index === currentStep ? step.icon : '⏳'}
                        </div>
                        <div className="tableberg-ai-loading-step-content">
                            <div className="tableberg-ai-loading-step-label">{step.label}</div>
                            <div className="tableberg-ai-loading-step-description">
                                {index === currentStep ? step.description : ''}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            
            <div className="tableberg-ai-loading-tips">
                <div className="tableberg-ai-loading-tip">
                    {tips[currentTip]}
                </div>
            </div>
            
            <div className="tableberg-ai-loading-time">
                {__("Elapsed time:", "tableberg")} {Math.round(elapsedTime / 1000)}s
            </div>
        </div>
    );
}