import React, { useState } from "react";
import "./Bot.css"

const Bot = () => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [fitnessGoal, setFitnessGoal] = useState("general_fitness");
  const [experienceLevel, setExperienceLevel] = useState("beginner");
  const [dietPreference, setDietPreference] = useState("veg");
  const [fitnessPlan, setFitnessPlan] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleNext = () => {
    if (step === 6) {
      submitData();
    } else {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const submitData = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://127.0.0.1:5000/generate_plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          age: Number(age),
          weight: Number(weight),
          height: Number(height),
          fitness_goal: fitnessGoal,
          experience_level: experienceLevel,
          diet_preference: dietPreference,
        }),
      });

      const data = await response.json();
      setFitnessPlan(data);
    } catch (error) {
      console.error("Error fetching fitness plan:", error);
    }
    setLoading(false);
  };

  return (
    <div className="bot-container">
      {fitnessPlan ? (
        <div>
          <h2>Fitness Plan for {fitnessPlan.name}</h2>
          <p><strong>BMI:</strong> {fitnessPlan.bmi} ({fitnessPlan.bmi_category})</p>
          <p><strong>Workout Days:</strong> {fitnessPlan.recommended_workout_days} per week</p>
          <p><strong>Cardio:</strong> {fitnessPlan.cardio_minutes} min/day</p>
          <p><strong>Workout Type:</strong> {fitnessPlan.workout_type}</p>
          <h3>Daily Nutrition</h3>
          <p><strong>Calories:</strong> {fitnessPlan.daily_nutrition.calories} kcal</p>
          <p><strong>Protein:</strong> {fitnessPlan.daily_nutrition.protein_g}g</p>
          <p><strong>Carbs:</strong> {fitnessPlan.daily_nutrition.carbs_g}g</p>
          <p><strong>Fats:</strong> {fitnessPlan.daily_nutrition.fats_g}g</p>
          <p><strong>Estimated Monthly Budget:</strong> ₹{fitnessPlan.monthly_budget_inr}</p>
          <button onClick={() => setFitnessPlan(null)}>Restart</button>
        </div>
      ) : (
        <>
          {step === 1 && (
            <div>
              <h2>Welcome to Fitness Chatbot!</h2>
              <p>What's your name?</p>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
              <button onClick={handleNext} disabled={!name.trim()}>Next</button>
            </div>
          )}

          {step === 2 && (
            <div>
              <p>How old are you?</p>
              <input type="number" value={age} onChange={(e) => setAge(e.target.value)} />
              <button onClick={handleBack}>Back</button>
              <button onClick={handleNext} disabled={!age || age <= 0}>Next</button>
            </div>
          )}

          {step === 3 && (
            <div>
              <p>Enter your weight (kg):</p>
              <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} />
              <button onClick={handleBack}>Back</button>
              <button onClick={handleNext} disabled={!weight || weight <= 0}>Next</button>
            </div>
          )}

          {step === 4 && (
            <div>
              <p>Enter your height (cm):</p>
              <input type="number" value={height} onChange={(e) => setHeight(e.target.value)} />
              <button onClick={handleBack}>Back</button>
              <button onClick={handleNext} disabled={!height || height <= 0}>Next</button>
            </div>
          )}

          {step === 5 && (
            <div>
              <p>What is your fitness goal?</p>
              <select value={fitnessGoal} onChange={(e) => setFitnessGoal(e.target.value)}>
                <option value="weight_loss">Weight Loss</option>
                <option value="muscle_gain">Muscle Gain</option>
                <option value="general_fitness">General Fitness</option>
              </select>
              <button onClick={handleBack}>Back</button>
              <button onClick={handleNext}>Next</button>
            </div>
          )}

          {step === 6 && (
            <div>
              <p>What is your experience level?</p>
              <select value={experienceLevel} onChange={(e) => setExperienceLevel(e.target.value)}>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
              <button onClick={handleBack}>Back</button>
              <button onClick={handleNext}>Next</button>
            </div>
          )}

          {step === 7 && (
            <div>
              <p>What is your diet preference?</p>
              <select value={dietPreference} onChange={(e) => setDietPreference(e.target.value)}>
                <option value="veg">Vegetarian</option>
                <option value="non-veg">Non-Vegetarian</option>
              </select>
              <button onClick={handleBack}>Back</button>
              <button onClick={handleNext}>Generate Plan</button>
            </div>
          )}

          {loading && <p>Generating your fitness plan...</p>}
        </>
      )}
    </div>
  );
};

export default Bot;
