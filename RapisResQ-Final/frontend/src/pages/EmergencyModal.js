import React, { useState, useEffect } from "react";
import "./EmergencyModal.css";

function EmergencyModal(props) {
  const { isOpen, onClose, title, steps } = props;
  const [currentStep, setCurrentStep] = useState(0);

  // Reset steps when modal opens or emergency type changes
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
    }
  }, [isOpen, title]);

  if (!isOpen || !steps || steps.length === 0) return null;

  const totalSteps = steps.length;
  const progress = Math.round(((currentStep + 1) / totalSteps) * 100);

  function nextStep() {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    }
  }

  function prevStep() {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  }

  return React.createElement(
    "div",
    { className: "modal-overlay" },

    React.createElement(
      "div",
      { className: "emergency-modal" },

      /* Header */
      React.createElement(
        "div",
        { className: "modal-header" },
        React.createElement("span", { className: "badge-critical" }, "Critical"),
        React.createElement("span", { className: "time" }, "3–5 min")
      ),

      /* Title */
      React.createElement("h2", { className: "modal-title" }, title),

      /* Progress Info */
      React.createElement(
        "div",
        { className: "progress-wrapper" },
        React.createElement(
          "span",
          null,
          `Step ${currentStep + 1} of ${totalSteps}`
        ),
        React.createElement(
          "span",
          { className: "progress-text" },
          `${progress}% Complete`
        )
      ),

      /* Progress Bar */
      React.createElement(
        "div",
        { className: "progress-bar" },
        React.createElement("div", {
          className: "progress-fill",
          style: { width: progress + "%" }
        })
      ),

      /* Step Content */
      React.createElement(
        "div",
        { className: "step-content" },
        React.createElement(
          "div",
          { className: "step-number" },
          currentStep + 1
        ),
        React.createElement("h3", null, "Action Required")
      ),

      React.createElement(
        "p",
        { className: "description" },
        steps[currentStep]
      ),

      /* Fire-specific warning (matches screenshot behavior) */
      title.includes("FIRE") &&
        React.createElement(
          "div",
          { className: "warning-box" },
          "⚠️ If clothes catch fire: STOP, DROP, and ROLL."
        ),

      /* Step Dots */
      React.createElement(
        "div",
        { className: "dots" },
        steps.map(function (_, index) {
          return React.createElement("span", {
            key: index,
            className:
              "dot" + (index === currentStep ? " active" : "")
          });
        })
      ),

      /* Footer Buttons */
      React.createElement(
        "div",
        { className: "modal-footer" },

        React.createElement(
          "button",
          {
            className: "btn-outline",
            onClick: prevStep,
            disabled: currentStep === 0
          },
          "← Previous"
        ),

        currentStep === totalSteps - 1
          ? React.createElement(
              "button",
              { className: "btn-success", disabled: true },
              "✔ Completed"
            )
          : React.createElement(
              "button",
              { className: "btn-primary", onClick: nextStep },
              "Next →"
            )
      ),

      /* Close Button */
      React.createElement(
        "button",
        { className: "close-btn", onClick: onClose },
        "×"
      )
    )
  );
}

export default EmergencyModal;
