import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { ChangeEvent, FormEvent, useState } from "react";
import { toast } from "sonner";

interface NewNoteCardProps {
  onNoteCreated: (content: string) => void;
}

let speechRecognition: SpeechRecognition | null = null;

export function NewNoteCard({ onNoteCreated }: NewNoteCardProps) {
  const [shouldShowOnboarding, setShouldShowOnboarding] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [content, setContent] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("en-US");
  const [isLanguageSelectDisabled, setIsLanguageSelectDisabled] =
    useState(false);

  function handleStartEditor() {
    setShouldShowOnboarding(false);
  }

  function handleContentChanged(event: ChangeEvent<HTMLTextAreaElement>) {
    setContent(event.target.value);

    if (event.target.value === "") {
      setShouldShowOnboarding(true);
    }
  }

  function handleSaveNote(event: FormEvent) {
    event.preventDefault();

    if (content === "") {
      return;
    }

    onNoteCreated(content);

    setContent("");
    setShouldShowOnboarding(true);

    toast.success("Note created successfully!");
  }

  function handleLanguageChange(event: ChangeEvent<HTMLSelectElement>) {
    setSelectedLanguage(event.target.value);
  }

  function handleStartRecording() {
    const isSpeechRecognitionAPIAvailable =
      "SpeechRecognition" in window || "webkitSpeechRecognition" in window;

    if (!isSpeechRecognitionAPIAvailable) {
      alert("Unfortunately, your browser does not support the recording API.");
      return;
    }

    setIsRecording(true);
    setIsLanguageSelectDisabled(true);
    setShouldShowOnboarding(false);

    const SpeechRecognitionAPI =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    speechRecognition = new SpeechRecognitionAPI();

    speechRecognition.lang = selectedLanguage;
    speechRecognition.continuous = true;
    speechRecognition.maxAlternatives = 1;
    speechRecognition.interimResults = true;

    speechRecognition.onresult = (event) => {
      const transcription = Array.from(event.results).reduce((text, result) => {
        return text.concat(result[0].transcript);
      }, "");

      setContent(transcription);
    };

    speechRecognition.onerror = (event) => {
      console.error(event);
    };

    speechRecognition.start();
  }

  function handleStopRecording() {
    setIsRecording(false);

    if (speechRecognition !== null) {
      speechRecognition.stop();
    }

    setIsLanguageSelectDisabled(false);
  }

  return (
    <Dialog.Root>
      <Dialog.Trigger className="rounded-md flex flex-col gap-3 text-left bg-slate-700 p-5 hover:ring-2 hover:ring-slate-600 focus-visible:ring-1 focus-visible:ring-lime-400 outline-none">
        <span className="text-sm font-medium text-slate-200">Add note</span>
        <p className="text-sm leading-6 text-slate-400">
          Record an audio note that will be converted to text automatically.
        </p>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="inset-0 fixed bg-black/50" />
        <Dialog.Content className="fixed md:overflow-hidden inset-0 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-[640px] md:h-[60vh] w-full bg-slate-700 outline-none flex flex-col md:rounded-md">
          <Dialog.Close className="absolute right-0 top-0 p-1.5 text-slate-400 bg-slate-800 xl:bg-transparent hover:xl:bg-slate-800 focus-visible:ring-1 focus-visible:ring-slate-800 outline-none">
            <X className="size-5" />
          </Dialog.Close>

          <form className="flex-1 flex flex-col">
            <div className="flex flex-1 flex-col gap-3 p-5">
              <span className="text-sm font-medium text-slate-300">
                Add note
              </span>

              <div className="max-w-[158px]">
                <label className="text-sm font-medium">
                  <select
                    className={`text-sm p-2 border rounded-md bg-transparent text-slate-400 outline-none ${
                      isRecording
                        ? "cursor-not-allowed border-slate-500"
                        : "border-slate-500 hover:border-slate-800 focus:border-slate-800"
                    } ${selectedLanguage === "pt-BR" ? "pr-6" : "pr-0"}`}
                    value={selectedLanguage}
                    onChange={handleLanguageChange}
                    disabled={isLanguageSelectDisabled}
                  >
                    <option value="en-US">English (US)</option>
                    <option value="pt-BR">Português (BR)</option>
                  </select>
                </label>
              </div>

              {shouldShowOnboarding ? (
                <p className="text-sm leading-6 text-slate-400">
                  Start by{" "}
                  <button
                    type="button"
                    onClick={handleStartRecording}
                    className="font-medium text-lime-400 hover:underline focus-visible:ring-1 focus-visible:ring-lime-800 outline-none"
                  >
                    recording an audio note
                  </button>{" "}
                  or if you prefer{" "}
                  <button
                    type="button"
                    onClick={handleStartEditor}
                    className="font-medium text-lime-400 hover:underline focus-visible:ring-1 focus-visible:ring-lime-800 outline-none"
                  >
                    use only text
                  </button>
                  .
                </p>
              ) : (
                <textarea
                  autoFocus
                  className="text-sm leading-6 text-slate-400 bg-transparent resize-none flex-1 outline-none"
                  onChange={handleContentChanged}
                  value={content}
                />
              )}
            </div>

            {isRecording ? (
              <button
                type="button"
                onClick={handleStopRecording}
                className="w-full flex items-center justify-center gap-2 bg-slate-900 py-4 text-center text-sm text-slate-300 outline-none font-medium hover:text-slate-100"
              >
                <div className="size-3 rounded-full bg-red-500 animate-pulse" />
                Recording in progress! (click to stop)
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSaveNote}
                className="w-full bg-lime-400 py-4 text-center text-sm text-lime-950 font-medium outline-none hover:bg-lime-500"
              >
                Save note
              </button>
            )}
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
