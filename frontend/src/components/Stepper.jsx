import React from 'react';

const STEPS = ['Options', 'Value', 'Process'];

export default function Stepper({ currentStep }) {
  return (
    <div className="stepper">
      {STEPS.map((label, index) => {
        const stepNumber = index + 1;
        const isDone = stepNumber < currentStep;
        const isActive = stepNumber === currentStep;

        return (
          <React.Fragment key={label}>
            <div
              className={`stepper__step${isActive ? ' stepper__step--active' : ''}${isDone ? ' stepper__step--done' : ''}`}
            >
              <div className="stepper__circle">
                {isDone ? '✓' : stepNumber}
              </div>
              <span className="stepper__label">{label}</span>
            </div>
            {index < STEPS.length - 1 && <div className="stepper__line" />}
          </React.Fragment>
        );
      })}
    </div>
  );
}
