
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Plus, Save, Trash, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useQuizzes } from "@/providers/QuizzesProvider";
import { useQuestions } from "@/providers/QuestionsProvider";
import { Textarea } from "@/components/ui/textarea";
import { Question } from "@/types";

export default function QuizQuestionsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { quizzes } = useQuizzes();
  const { questions, createQuestion, updateQuestion, deleteQuestion, getQuestionsByQuiz } = useQuestions();
  
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
  const [currentQuiz, setCurrentQuiz] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // New question form state
  const [newQuestion, setNewQuestion] = useState({
    text: "",
    type: "multiple_choice" as const,
    options: ["", "", "", ""],
    correctAnswer: "",
    points: 1
  });

  useEffect(() => {
    if (id) {
      // Find the current quiz
      const quiz = quizzes.find(q => q.id === id);
      if (quiz) {
        setCurrentQuiz(quiz);
      }
      
      // Get questions for this quiz
      const quizQuestions = getQuestionsByQuiz(id);
      setQuizQuestions(quizQuestions);
    }
  }, [id, quizzes, questions, getQuestionsByQuiz]);

  // Handle adding a new question
  const handleAddQuestion = async () => {
    if (!id) return;
    
    if (!newQuestion.text) {
      toast({
        title: "Missing information",
        description: "Please enter a question text",
        variant: "destructive"
      });
      return;
    }
    
    if (newQuestion.type === "multiple_choice") {
      // Check if all options are filled
      const emptyOptions = newQuestion.options.filter(option => !option.trim()).length;
      if (emptyOptions > 0) {
        toast({
          title: "Missing information",
          description: "Please provide all four options",
          variant: "destructive"
        });
        return;
      }
      
      // Check if correctAnswer is selected
      if (!newQuestion.correctAnswer) {
        toast({
          title: "Missing information",
          description: "Please select the correct answer",
          variant: "destructive"
        });
        return;
      }
    }
    
    setIsLoading(true);
    
    try {
      await createQuestion({
        quizId: id,
        text: newQuestion.text,
        type: newQuestion.type,
        options: newQuestion.options,
        correctAnswer: newQuestion.correctAnswer,
        points: newQuestion.points
      });
      
      // Reset form
      setNewQuestion({
        text: "",
        type: "multiple_choice",
        options: ["", "", "", ""],
        correctAnswer: "",
        points: 1
      });
      
      toast({
        title: "Success",
        description: "Question added successfully"
      });
    } catch (error) {
      console.error("Error adding question:", error);
      toast({
        title: "Error",
        description: "Failed to add question",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle updating an option in the new question form
  const handleOptionChange = (index: number, value: string) => {
    const updatedOptions = [...newQuestion.options];
    updatedOptions[index] = value;
    setNewQuestion({ ...newQuestion, options: updatedOptions });
  };
  
  // Handle deleting a question
  const handleDeleteQuestion = async (questionId: string) => {
    if (confirm("Are you sure you want to delete this question?")) {
      setIsLoading(true);
      try {
        await deleteQuestion(questionId);
        toast({
          title: "Success",
          description: "Question deleted successfully"
        });
      } catch (error) {
        console.error("Error deleting question:", error);
        toast({
          title: "Error",
          description: "Failed to delete question",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  // Navigate back to quiz details/list
  const handleBack = () => {
    navigate("/admin/courses");
  };
  
  if (!currentQuiz) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Courses
          </Button>
        </div>
        <Card>
          <CardContent className="pt-6">
            <p>Quiz not found or loading...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Button variant="ghost" onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Courses
          </Button>
          <h1 className="text-3xl font-bold mt-4">Questions for: {currentQuiz.title}</h1>
          <p className="text-gray-600">{currentQuiz.description}</p>
        </div>
      </div>
      
      {/* Add new question form */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Add New Question</CardTitle>
          <CardDescription>Create a multiple-choice question with 4 options</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="question-text">Question Text</Label>
            <Textarea
              id="question-text"
              placeholder="Enter your question here..."
              value={newQuestion.text}
              onChange={(e) => setNewQuestion({ ...newQuestion, text: e.target.value })}
              className="mt-1"
              rows={2}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[0, 1, 2, 3].map((index) => (
              <div key={index} className="space-y-1">
                <Label htmlFor={`option-${index}`}>Option {String.fromCharCode(65 + index)}</Label>
                <Input
                  id={`option-${index}`}
                  value={newQuestion.options[index]}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  placeholder={`Enter option ${String.fromCharCode(65 + index)}`}
                />
              </div>
            ))}
          </div>
          
          <div>
            <Label>Correct Answer</Label>
            <RadioGroup
              value={newQuestion.correctAnswer}
              onValueChange={(value) => setNewQuestion({ ...newQuestion, correctAnswer: value })}
              className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-1"
            >
              {[0, 1, 2, 3].map((index) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem value={String.fromCharCode(65 + index)} id={`answer-${index}`} />
                  <Label htmlFor={`answer-${index}`}>Option {String.fromCharCode(65 + index)}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          
          <div>
            <Label htmlFor="points">Points</Label>
            <Input
              id="points"
              type="number"
              min={1}
              max={10}
              value={newQuestion.points}
              onChange={(e) => setNewQuestion({ ...newQuestion, points: parseInt(e.target.value) || 1 })}
              className="mt-1 w-24"
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleAddQuestion} disabled={isLoading}>
            <Plus className="mr-2 h-4 w-4" /> Add Question
          </Button>
        </CardFooter>
      </Card>
      
      {/* List of existing questions */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold mb-4">Existing Questions ({quizQuestions.length})</h2>
        
        {quizQuestions.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-gray-600">No questions have been added to this quiz yet.</p>
              <p className="text-gray-600 text-sm mt-1">Add your first question using the form above.</p>
            </CardContent>
          </Card>
        ) : (
          quizQuestions.map((question, index) => (
            <Card key={question.id}>
              <CardHeader>
                <CardTitle className="flex justify-between">
                  <span>Q{index + 1}: {question.text}</span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleDeleteQuestion(question.id)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </CardTitle>
                <CardDescription>
                  {question.type === "multiple_choice" ? "Multiple choice" : question.type} - {question.points} point{question.points !== 1 ? 's' : ''}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {question.type === "multiple_choice" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {question.options && question.options.map((option, i) => (
                      <div 
                        key={i} 
                        className={`p-2 border rounded ${
                          question.correctAnswer === String.fromCharCode(65 + i) 
                            ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                            : 'border-gray-200'
                        }`}
                      >
                        <span className="font-medium mr-2">{String.fromCharCode(65 + i)}:</span> 
                        {option}
                        {question.correctAnswer === String.fromCharCode(65 + i) && (
                          <span className="ml-2 text-green-600 text-xs font-medium">
                            ✓ Correct
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
