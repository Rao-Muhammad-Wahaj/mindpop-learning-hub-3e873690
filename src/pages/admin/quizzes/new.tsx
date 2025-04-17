
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, Trash2, ArrowLeft, Save } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Mock course data for the select dropdown
const mockCourses = [
  { id: "1", title: "Introduction to Mathematics" },
  { id: "2", title: "Basic Physics" },
  { id: "3", title: "Advanced Biology" },
  { id: "4", title: "Chemistry Fundamentals" },
  { id: "5", title: "World History Survey" },
  { id: "6", title: "Creative Writing" },
];

interface Question {
  id: string;
  text: string;
  type: "multiple_choice" | "true_false" | "short_answer";
  options: string[];
  correctAnswer: string | string[];
  points: number;
}

export default function CreateQuizPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("details");
  const [saving, setSaving] = useState(false);

  const [quizData, setQuizData] = useState({
    title: "",
    description: "",
    courseId: "",
    timeLimit: 30, // minutes
    passingScore: 70, // percentage
    reviewEnabled: true,
  });

  const [questions, setQuestions] = useState<Question[]>([
    {
      id: `q_${Date.now()}`,
      text: "",
      type: "multiple_choice",
      options: ["", "", "", ""],
      correctAnswer: "",
      points: 1,
    },
  ]);

  const handleQuizChange = (field: string, value: string | number | boolean) => {
    setQuizData((prev) => ({ ...prev, [field]: value }));
  };

  const handleQuestionChange = (id: string, field: string, value: any) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, [field]: value } : q))
    );
  };

  const handleOptionChange = (questionId: string, index: number, value: string) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id === questionId) {
          const newOptions = [...q.options];
          newOptions[index] = value;
          return { ...q, options: newOptions };
        }
        return q;
      })
    );
  };

  const addQuestion = () => {
    const newQuestion: Question = {
      id: `q_${Date.now()}`,
      text: "",
      type: "multiple_choice",
      options: ["", "", "", ""],
      correctAnswer: "",
      points: 1,
    };
    setQuestions((prev) => [...prev, newQuestion]);
  };

  const removeQuestion = (id: string) => {
    if (questions.length > 1) {
      setQuestions((prev) => prev.filter((q) => q.id !== id));
    }
  };

  const handleSetCorrectAnswer = (questionId: string, value: string) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === questionId ? { ...q, correctAnswer: value } : q))
    );
  };

  const validateQuiz = () => {
    if (!quizData.title || !quizData.description || !quizData.courseId) {
      return false;
    }

    return questions.every(
      (q) =>
        q.text &&
        (q.type !== "multiple_choice" || q.options.every((o) => o)) &&
        q.correctAnswer
    );
  };

  const handleSaveQuiz = async () => {
    if (!validateQuiz()) {
      alert("Please fill in all required fields for the quiz and questions.");
      return;
    }

    setSaving(true);

    try {
      // In a real app, this would save to Supabase
      // For demo, we'll just simulate a delay and redirect
      await new Promise((resolve) => setTimeout(resolve, 1500));
      navigate(`/admin/courses/${quizData.courseId}`);
    } catch (error) {
      console.error("Error saving quiz:", error);
      alert("Failed to save quiz. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="mr-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="mindpop-heading mb-2">Create New Quiz</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Add a new quiz to your course
            </p>
          </div>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-3">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveQuiz}
            disabled={saving}
            className="flex items-center"
          >
            {saving ? "Saving..." : "Save Quiz"}
            {!saving && <Save className="ml-2 h-4 w-4" />}
          </Button>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="details">Quiz Details</TabsTrigger>
          <TabsTrigger value="questions">Questions</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <Card>
              <CardHeader>
                <CardTitle>Quiz Information</CardTitle>
                <CardDescription>
                  Enter the basic details for your quiz
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <motion.div variants={itemVariants} className="space-y-2">
                  <Label htmlFor="course">Course</Label>
                  <Select
                    value={quizData.courseId}
                    onValueChange={(value) =>
                      handleQuizChange("courseId", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a course" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockCourses.map((course) => (
                        <SelectItem key={course.id} value={course.id}>
                          {course.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </motion.div>

                <motion.div variants={itemVariants} className="space-y-2">
                  <Label htmlFor="title">Quiz Title</Label>
                  <Input
                    id="title"
                    value={quizData.title}
                    onChange={(e) => handleQuizChange("title", e.target.value)}
                    placeholder="Enter quiz title"
                  />
                </motion.div>

                <motion.div variants={itemVariants} className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={quizData.description}
                    onChange={(e) =>
                      handleQuizChange("description", e.target.value)
                    }
                    placeholder="Describe what this quiz covers"
                    rows={4}
                  />
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <motion.div variants={itemVariants} className="space-y-2">
                    <Label htmlFor="timeLimit">Time Limit (minutes)</Label>
                    <Input
                      id="timeLimit"
                      type="number"
                      min="1"
                      value={quizData.timeLimit}
                      onChange={(e) =>
                        handleQuizChange("timeLimit", parseInt(e.target.value))
                      }
                    />
                  </motion.div>

                  <motion.div variants={itemVariants} className="space-y-2">
                    <Label htmlFor="passingScore">
                      Passing Score (percentage)
                    </Label>
                    <Input
                      id="passingScore"
                      type="number"
                      min="0"
                      max="100"
                      value={quizData.passingScore}
                      onChange={(e) =>
                        handleQuizChange(
                          "passingScore",
                          parseInt(e.target.value)
                        )
                      }
                    />
                  </motion.div>
                </div>

                <motion.div
                  variants={itemVariants}
                  className="flex items-center space-x-2 pt-2"
                >
                  <Switch
                    id="reviewEnabled"
                    checked={quizData.reviewEnabled}
                    onCheckedChange={(checked) =>
                      handleQuizChange("reviewEnabled", checked)
                    }
                  />
                  <Label htmlFor="reviewEnabled">
                    Enable quiz review after completion
                  </Label>
                </motion.div>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  onClick={() => setActiveTab("questions")}
                >
                  Continue to Questions
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="questions">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            {questions.map((question, index) => (
              <motion.div key={question.id} variants={itemVariants}>
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle>Question {index + 1}</CardTitle>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeQuestion(question.id)}
                        disabled={questions.length === 1}
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor={`question-${question.id}`}>
                        Question Text
                      </Label>
                      <Textarea
                        id={`question-${question.id}`}
                        value={question.text}
                        onChange={(e) =>
                          handleQuestionChange(
                            question.id,
                            "text",
                            e.target.value
                          )
                        }
                        placeholder="Enter your question here"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`type-${question.id}`}>
                        Question Type
                      </Label>
                      <Select
                        value={question.type}
                        onValueChange={(value) =>
                          handleQuestionChange(
                            question.id,
                            "type",
                            value as "multiple_choice" | "true_false" | "short_answer"
                          )
                        }
                      >
                        <SelectTrigger id={`type-${question.id}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="multiple_choice">
                            Multiple Choice
                          </SelectItem>
                          <SelectItem value="true_false">True/False</SelectItem>
                          <SelectItem value="short_answer">
                            Short Answer
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`points-${question.id}`}>
                        Points (1-10)
                      </Label>
                      <Input
                        id={`points-${question.id}`}
                        type="number"
                        min="1"
                        max="10"
                        value={question.points}
                        onChange={(e) =>
                          handleQuestionChange(
                            question.id,
                            "points",
                            parseInt(e.target.value)
                          )
                        }
                      />
                    </div>

                    {question.type === "multiple_choice" && (
                      <div className="space-y-3">
                        <Label>Answer Options</Label>
                        {question.options.map((option, optIndex) => (
                          <div
                            key={`${question.id}-option-${optIndex}`}
                            className="flex items-center space-x-2"
                          >
                            <div className="flex-grow">
                              <Input
                                value={option}
                                onChange={(e) =>
                                  handleOptionChange(
                                    question.id,
                                    optIndex,
                                    e.target.value
                                  )
                                }
                                placeholder={`Option ${optIndex + 1}`}
                              />
                            </div>
                            <div className="flex items-center">
                              <input
                                type="radio"
                                name={`correct-${question.id}`}
                                id={`${question.id}-option-${optIndex}-correct`}
                                checked={question.correctAnswer === option}
                                onChange={() =>
                                  handleSetCorrectAnswer(question.id, option)
                                }
                                disabled={!option}
                                className="h-4 w-4 text-mindpop-400 focus:ring-mindpop-300"
                              />
                              <Label
                                htmlFor={`${question.id}-option-${optIndex}-correct`}
                                className="ml-2 text-sm"
                              >
                                Correct
                              </Label>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {question.type === "true_false" && (
                      <div className="space-y-3">
                        <Label>Correct Answer</Label>
                        <div className="flex space-x-4">
                          <div className="flex items-center">
                            <input
                              type="radio"
                              name={`correct-${question.id}`}
                              id={`${question.id}-true`}
                              checked={question.correctAnswer === "true"}
                              onChange={() =>
                                handleSetCorrectAnswer(question.id, "true")
                              }
                              className="h-4 w-4 text-mindpop-400 focus:ring-mindpop-300"
                            />
                            <Label
                              htmlFor={`${question.id}-true`}
                              className="ml-2"
                            >
                              True
                            </Label>
                          </div>
                          <div className="flex items-center">
                            <input
                              type="radio"
                              name={`correct-${question.id}`}
                              id={`${question.id}-false`}
                              checked={question.correctAnswer === "false"}
                              onChange={() =>
                                handleSetCorrectAnswer(question.id, "false")
                              }
                              className="h-4 w-4 text-mindpop-400 focus:ring-mindpop-300"
                            />
                            <Label
                              htmlFor={`${question.id}-false`}
                              className="ml-2"
                            >
                              False
                            </Label>
                          </div>
                        </div>
                      </div>
                    )}

                    {question.type === "short_answer" && (
                      <div className="space-y-2">
                        <Label htmlFor={`answer-${question.id}`}>
                          Correct Answer
                        </Label>
                        <Input
                          id={`answer-${question.id}`}
                          value={
                            question.correctAnswer as string
                          }
                          onChange={(e) =>
                            handleSetCorrectAnswer(question.id, e.target.value)
                          }
                          placeholder="Enter the correct answer"
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          For short answer questions, student responses must
                          match exactly.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}

            <div className="flex justify-center">
              <Button
                variant="outline"
                className="flex items-center"
                onClick={addQuestion}
              >
                <Plus className="mr-2 h-4 w-4" /> Add Question
              </Button>
            </div>

            <div className="flex justify-between pt-4">
              <Button
                variant="outline"
                onClick={() => setActiveTab("details")}
              >
                Back to Details
              </Button>
              <Button onClick={handleSaveQuiz} disabled={saving}>
                {saving ? "Saving..." : "Save Quiz"}
              </Button>
            </div>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
