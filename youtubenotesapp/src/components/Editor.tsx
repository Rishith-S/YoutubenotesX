import EditorJS, { OutputData, ToolConstructable } from "@editorjs/editorjs";
import Header from "@editorjs/header";
import EditorjsList from "@editorjs/list";
import Table from "@editorjs/table";
import CodeTool from "@editorjs/code";
import { useEffect, useRef, useState } from "react";
import ImageTool from "@editorjs/image";
import axios from "axios";
import LoadingScreen from "./LoadingScreen";
import { Save, FileText } from "lucide-react";

interface ImageUpload {
  success: number;
  file: {
    url: string;
  };
}

interface NotesDetails {
  success: number;
  notesDetails: {
    id: number;
    notesContent: OutputData;
  };
}

export function Editor({
  videoId,
  playListId,
  onSave,
}: {
  videoId: string;
  playListId: string;
  onSave?: () => void;
}) {
  const [loading, setLoading] = useState(true);
  const [contentData, setContentData] = useState<OutputData>({
    blocks: [],
  });
  const [_, setPreviousContentData] = useState<OutputData>({
    blocks: [],
  });
  const editorRef = useRef<EditorJS | null>(null);

  const handleSaveButton = async () => {
    try {
      await axios.post(
        `${
          import.meta.env.VITE_SERVER_URL
        }/notes/setNote/${videoId}/${playListId}`,
        { notesContent: contentData },
        { withCredentials: true }
      );
      if (onSave) onSave();
    } catch (error) {
      console.error("Error saving notes:", error);
    }
  };

  // Expose save handler
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).__editorSave = handleSaveButton;
    }
    return () => {
      if (typeof window !== 'undefined') {
        delete (window as any).__editorSave;
      }
    };
  }, [contentData]);

  const handleSave = async (content: { blocks: any[] }) => {
    setPreviousContentData((prev) => {
      const previousImages = prev.blocks
        .filter((block) => block.type === "image")
        .map((block) => block.data.file.url);

      const currentImages = content.blocks
        .filter((block) => block.type === "image")
        .map((block) => block.data.file.url);

      const deletedImages = previousImages.filter(
        (url) => !currentImages.includes(url)
      );

      if (deletedImages.length > 0) {
        axios
          .post(
            `${import.meta.env.VITE_SERVER_URL}/notes/deleteFiles`,
            {
              urls: deletedImages,
            },
            {
              withCredentials: true,
              headers: {
                "Content-Type": "application/json",
              },
            }
          )
          .catch((error) => console.error("Axios Error:", error));
      }
      return content;
    });
  };

  const initEditor = () => {
    // Destroy existing editor if it exists
    if (editorRef.current) {
      editorRef.current.destroy();
      editorRef.current = null;
    }

    const editor = new EditorJS({
      data: contentData,
      holder: "editorjs",
      placeholder: "Write your notes",
      tools: {
        header: {
          class: Header as unknown as ToolConstructable,
          inlineToolbar: ["link"],
          config: {
            levels: [1, 2, 3, 4],
          },
        },
        list: {
          class: EditorjsList as unknown as ToolConstructable,
          inlineToolbar: true,
          config: {
            defaultStyle: "unordered",
          },
        },
        image: {
          class: ImageTool,
          config: {
            uploader: {
              async uploadByFile(file: any) {
                if (!file || !(file instanceof Blob)) {
                  console.error("Invalid file input");
                  return;
                }

                const formData = new FormData();
                formData.append("file", file);

                const response = await axios.post(
                  `${import.meta.env.VITE_SERVER_URL}/notes/uploadFile`,
                  formData,
                  {
                    withCredentials: true,
                    headers: {
                      "Content-Type": "multipart/form-data",
                    },
                  }
                );

                if ((response.data as unknown as ImageUpload).success === 1) {
                  return response.data;
                }
              },
            },
            inlineToolbar: true,
          },
        },
        table: Table,
        code: CodeTool,
      },
      onReady: () => {
        editorRef.current = editor;
        // Set focus to end of content after editor is ready
        if (contentData.blocks && contentData.blocks.length > 0) {
          setTimeout(() => {
            const lastBlockIndex = contentData.blocks.length - 1;
            editor.caret.setToBlock(lastBlockIndex, 'end');
          }, 100);
        }
      },
      autofocus: true,
      onChange: async () => {
        const data = await editor.save();
        handleSave(data);
        setContentData(data);
      },
    });

    editorRef.current = editor;
  };

  // Fetch notes when videoId changes
  useEffect(() => {
    const fetchNotes = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_SERVER_URL}/notes/getNote/${videoId}`,
          { withCredentials: true }
        );

        if ((res.data as NotesDetails).success) {
          const notesContent = (res.data as NotesDetails).notesDetails
            .notesContent;
          setContentData(notesContent);
          setPreviousContentData(notesContent);
        } else {
          setContentData({
            blocks: [],
          });
          setPreviousContentData({
            blocks: [],
          });
        }
      } catch (error) {
        console.error("Error fetching notes:", error);
        setContentData({
          blocks: [],
        });
        setPreviousContentData({
          blocks: [],
        });
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();

    // Clean up editor when videoId changes
    return () => {
      if (editorRef.current) {
        editorRef.current.destroy();
        editorRef.current = null;
      }
    };
  }, [videoId]);

  // Initialize editor when loading completes
  useEffect(() => {
    if (!loading) {
      initEditor();
    }

    return () => {
      if (editorRef.current) {
        editorRef.current.destroy();
        editorRef.current = null;
      }
    };
  }, [loading]);

  if (loading) return <LoadingScreen />;

  return (
    <div className="h-full flex flex-col">
      {/* Notes Header */}
      <div className="px-6 py-4 border-b border-zinc-800 bg-zinc-950/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-zinc-400" />
          <h3 className="text-white font-semibold">Notes</h3>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleSaveButton}
            className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white rounded-lg transition-all flex items-center gap-2 text-sm font-medium">
            <Save className="w-4 h-4" />
            Save
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-auto p-6">
        <article className="prose lg:prose-xl">
          <div
            className="editorjs text-white selection:text-black"
            id="editorjs"
          ></div>
        </article>
      </div>
    </div>
  );
}
