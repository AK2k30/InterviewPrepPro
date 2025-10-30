import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ROLE_OPTIONS } from "@shared/schema";
import { ArrowRight, User, Briefcase, Upload, X, FileText } from "lucide-react";

interface UserRegistrationProps {
  onComplete: (data: { name: string; currentRole: string; targetRole: string; resumeFile?: File }) => void;
}

export default function UserRegistration({ onComplete }: UserRegistrationProps) {
  const [formData, setFormData] = useState({
    name: "",
    currentRole: "",
    targetRole: "",
  });

  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumePreview, setResumePreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleResumeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type (images only)
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setErrors({ ...errors, resume: 'Please upload a valid image file (JPG, PNG, WEBP)' });
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors({ ...errors, resume: 'File size must be less than 5MB' });
        return;
      }
      
      setResumeFile(file);
      setErrors({ ...errors, resume: '' });
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setResumePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveResume = () => {
    setResumeFile(null);
    setResumePreview(null);
    setErrors({ ...errors, resume: '' });
  };

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
    
    console.log("User registration completed:", formData, "Resume:", resumeFile?.name);
    onComplete({ ...formData, resumeFile: resumeFile || undefined });
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

            <div className="space-y-2">
              <Label htmlFor="resume" className="text-sm font-medium">
                Resume (Optional)
              </Label>
              <p className="text-xs text-muted-foreground mb-2">
                Upload your resume image for personalized interview questions
              </p>
              
              {!resumeFile ? (
                <div className="relative">
                  <Input
                    id="resume"
                    data-testid="input-resume"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleResumeUpload}
                    className="hidden"
                  />
                  <Label
                    htmlFor="resume"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                  >
                    <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Click to upload resume image</span>
                    <span className="text-xs text-muted-foreground mt-1">JPG, PNG, WEBP (Max 5MB)</span>
                  </Label>
                </div>
              ) : (
                <div className="relative border-2 rounded-lg p-4 bg-muted/20">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 h-6 w-6"
                    onClick={handleRemoveResume}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                  {resumePreview && (
                    <div className="mb-2">
                      <img
                        src={resumePreview}
                        alt="Resume preview"
                        className="w-full h-40 object-contain rounded"
                      />
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium truncate">{resumeFile.name}</span>
                    <span className="text-xs text-muted-foreground ml-auto">
                      {(resumeFile.size / 1024).toFixed(1)} KB
                    </span>
                  </div>
                </div>
              )}
              
              {errors.resume && (
                <p className="text-sm text-destructive" data-testid="error-resume">
                  {errors.resume}
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