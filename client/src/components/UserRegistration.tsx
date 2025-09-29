import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ROLE_OPTIONS } from "@shared/schema";
import { ArrowRight, User, Briefcase } from "lucide-react";

interface UserRegistrationProps {
  onComplete: (data: { name: string; currentRole: string; targetRole: string }) => void;
}

export default function UserRegistration({ onComplete }: UserRegistrationProps) {
  const [formData, setFormData] = useState({
    name: "",
    currentRole: "",
    targetRole: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.currentRole) newErrors.currentRole = "Current role is required";
    if (!formData.targetRole) newErrors.targetRole = "Target role is required";
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    console.log("User registration completed:", formData);
    onComplete(formData);
  };

  const isFormValid = formData.name.trim() && formData.currentRole && formData.targetRole;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
            <User className="w-8 h-8 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl font-semibold">Welcome to InterviewAce</CardTitle>
            <CardDescription className="text-base mt-2">
              Let's get you set up for your interview preparation journey
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Full Name
              </Label>
              <Input
                id="name"
                data-testid="input-name"
                type="text"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  if (errors.name) setErrors({ ...errors, name: "" });
                }}
                className={errors.name ? "border-destructive" : ""}
              />
              {errors.name && (
                <p className="text-sm text-destructive" data-testid="error-name">
                  {errors.name}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="currentRole" className="text-sm font-medium">
                Current Role
              </Label>
              <Select
                value={formData.currentRole}
                onValueChange={(value) => {
                  setFormData({ ...formData, currentRole: value });
                  if (errors.currentRole) setErrors({ ...errors, currentRole: "" });
                }}
              >
                <SelectTrigger data-testid="select-current-role" className={errors.currentRole ? "border-destructive" : ""}>
                  <SelectValue placeholder="Select your current role" />
                </SelectTrigger>
                <SelectContent>
                  {ROLE_OPTIONS.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.currentRole && (
                <p className="text-sm text-destructive" data-testid="error-current-role">
                  {errors.currentRole}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetRole" className="text-sm font-medium">
                Target Interview Role
              </Label>
              <Select
                value={formData.targetRole}
                onValueChange={(value) => {
                  setFormData({ ...formData, targetRole: value });
                  if (errors.targetRole) setErrors({ ...errors, targetRole: "" });
                }}
              >
                <SelectTrigger data-testid="select-target-role" className={errors.targetRole ? "border-destructive" : ""}>
                  <SelectValue placeholder="Select the role you're preparing for" />
                </SelectTrigger>
                <SelectContent>
                  {ROLE_OPTIONS.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.targetRole && (
                <p className="text-sm text-destructive" data-testid="error-target-role">
                  {errors.targetRole}
                </p>
              )}
            </div>

            <Button
              type="submit"
              data-testid="button-continue"
              className="w-full h-12 text-base font-medium"
              disabled={!isFormValid}
            >
              Start Interview Preparation
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}