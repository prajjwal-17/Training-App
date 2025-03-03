import { useState } from "react";
import { Card, Button, Form } from "react-bootstrap";
import { PencilSquare } from "react-bootstrap-icons";
import "bootstrap/dist/css/bootstrap.min.css";
import "./ProfilePage.css";

export default function ProfilePage() {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [usage, setUsage] = useState("");
  const [profileComplete, setProfileComplete] = useState(false);
  const [slideOut, setSlideOut] = useState(false);

  const handleNext = () => setStep(step + 1);

  const handleCreateProfile = () => {
    setSlideOut(true);
    setTimeout(() => {
      setProfileComplete(true);
    }, 600); // Wait for animation to finish
  };

  return (
    <div className="page-container">
      <div className={`onboarding-container ${slideOut ? "slide-out" : ""} ${profileComplete ? "hidden" : ""}`}>
        <Card className="onboarding-card">
          <Card.Body>
            <h3 className="onboarding-title">Welcome! Set Up Your Profile</h3>

            {step === 1 && (
              <>
                <Form.Group>
                  <Form.Label>What do we call you?</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </Form.Group>
                <Button className="next-btn" onClick={handleNext} disabled={!name}>
                  Next
                </Button>
              </>
            )}

            {step === 2 && (
              <>
                <Form.Group>
                  <Form.Label>How old are you?</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="Enter your age"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                  />
                </Form.Group>
                <Button className="next-btn" onClick={handleNext} disabled={!age}>
                  Next
                </Button>
              </>
            )}

            {step === 3 && (
              <>
                <Form.Group>
                  <Form.Label>How frequently will you use this app?</Form.Label>
                  <Form.Select value={usage} onChange={(e) => setUsage(e.target.value)}>
                    <option value="">Select</option>
                    <option value="2days/week">2 days/week</option>
                    <option value="3days/week">3 days/week</option>
                    <option value="4days/week">4 days/week</option>
                    <option value="5days/week">5 days/week</option>
                  </Form.Select>
                </Form.Group>
                <Button className="create-btn" onClick={handleCreateProfile} disabled={!usage}>
                  Create Profile
                </Button>
              </>
            )}
          </Card.Body>
        </Card>
      </div>

      <div className={`profile-container ${profileComplete ? "visible" : ""}`}>
        <Card className="profile-card">
          <Card.Img
            variant="top"
            src="https://source.unsplash.com/200x200/?person"
            className="profile-image"
          />
          <Card.Body>
            <Card.Title className="profile-name">{name}</Card.Title>
            <Card.Text className="profile-bio">
              Age: {age} | Usage: {usage}
            </Card.Text>
            <Button variant="primary" className="edit-btn">
              <PencilSquare size={20} className="me-2" /> Edit Profile
            </Button>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
}
