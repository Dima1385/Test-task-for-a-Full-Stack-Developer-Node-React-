import { useState } from 'react';
import Header from './components/Header';
import Screen1 from './components/Screen1';
import Screen2 from './components/Screen2';
import Screen3 from './components/Screen3';

const STEP_OPTIONS = 1;
const STEP_VALUE   = 2;
const STEP_PROCESS = 3;

export default function App() {
  const [step, setStep]           = useState(STEP_OPTIONS);
  const [option, setOption]       = useState(null);
  const [value, setValue]         = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  function handleOption(selected) {
    setOption(selected);
    setStep(STEP_VALUE);
  }

  function handleValue(numValue) {
    setValue(numValue);
    setStep(STEP_PROCESS);
  }

  function handleBack() {
    if (isProcessing) return;
    if (step === STEP_VALUE)   setStep(STEP_OPTIONS);
    if (step === STEP_PROCESS) setStep(STEP_VALUE);
  }

  function handleReset() {
    setOption(null);
    setValue(null);
    setIsProcessing(false);
    setStep(STEP_OPTIONS);
  }

  return (
    <div className="app">
      <Header
        step={step}
        totalSteps={3}
        onBack={handleBack}
        hideProgress={isProcessing}
      />

      {step === STEP_OPTIONS && (
        <Screen1 onContinue={handleOption} />
      )}

      {step === STEP_VALUE && (
        <Screen2
          option={option}
          onContinue={handleValue}
          onBack={handleBack}
        />
      )}

      {step === STEP_PROCESS && (
        <Screen3
          option={option}
          value={value}
          onReset={handleReset}
          onProcessingChange={setIsProcessing}
        />
      )}
    </div>
  );
}
