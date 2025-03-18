import EditorJS, { OutputData, ToolConstructable } from "@editorjs/editorjs";
import Header from "@editorjs/header";
import EditorjsList from "@editorjs/list";
import Table from "@editorjs/table";
import CodeTool from "@editorjs/code";
import { useEffect, useRef, useState } from "react";
import ImageTool from "@editorjs/image";
import axios from "axios";
import LoadingScreen from "./LoadingScreen";

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

export function Editor({ videoId, playListId }: { videoId: string, playListId:string }) {
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
        `${import.meta.env.VITE_SERVER_URL}/notes/setNote/${videoId}/${playListId}`,
        { notesContent: contentData },
        { withCredentials: true }
      );
    } catch (error) {
      console.error("Error saving notes:", error);
    }
  };

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
          const notesContent = (res.data as NotesDetails).notesDetails.notesContent;
          setContentData(notesContent);
          setPreviousContentData(notesContent);
        } else {
          setContentData({
            blocks: []
          });
          setPreviousContentData({
            blocks: []
          });
        }
      } catch (error) {
        console.error("Error fetching notes:", error);
        setContentData({
          blocks: []
        });
        setPreviousContentData({
          blocks: []
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
    <div>
      <div className="flex flex-end justify-end">
        <button
          onClick={handleSaveButton}
          className="cursor-pointer bg-orange-400 text-xl text-white rounded-xl overflow-auto p-2"
        >
          Save
        </button>
      </div>
      <article className="prose lg:prose-xl">
        <div
          className="editorjs text-white selection:text-black"
          id="editorjs"
        ></div>
      </article>
    </div>
  );
}