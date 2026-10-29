// "use client";
// import dynamic from "next/dynamic";
// import { useMemo } from "react";
// import { supabase } from "@/libs/supabase";
// import toast from "react-hot-toast";

// const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

// const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
// const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

// type Props = {
//   value: string;
//   onChange: (val: string) => void;
//   placeholder?: string;
// };

// export default function RichTextEditor({ value, onChange, placeholder = "" }: Props) {
//   const cleanHtml = (html: string) => {
//     return html
//       .replace(/background-color:[^;"]+;?/gi, "")
//       .replace(/color:[^;"]+;?/gi, "")
//       .replace(/width:[^;"]+;?/gi, "")
//       .replace(/height:[^;"]+;?/gi, "")
//       .replace(/white-space:[^;"]+;?/gi, "")
//       .replace(/style="[^"]*"/gi, "");
//   };

//   const handleImageUpload = () => {
//     const input = document.createElement("input");
//     input.setAttribute("type", "file");
//     input.setAttribute("accept", "image/jpeg,image/jpg,image/png,image/webp,image/gif");
//     input.click();

//     input.onchange = async () => {
//       const file = input.files?.[0];
//       if (!file) return;

//       // 🔥 VALIDASI TIPE FILE
//       if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
//         toast.error("Format gambar tidak didukung. Gunakan JPG, PNG, WEBP, atau GIF");
//         return;
//       }

//       // 🔥 VALIDASI UKURAN FILE
//       if (file.size > MAX_IMAGE_SIZE) {
//         toast.error("Ukuran gambar maksimal 5MB");
//         return;
//       }

//       // 🔥 SANITASI NAMA FILE
//       const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
//       const fileName = `editor-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extension}`;

//       const { error } = await supabase.storage.from("editor").upload(fileName, file, {
//         contentType: file.type,
//         cacheControl: "3600",
//       });

//       if (error) {
//         console.error("UPLOAD IMAGE ERROR:", error);
//         toast.error("Gagal upload gambar, silakan coba lagi");
//         return;
//       }

//       const { data } = supabase.storage.from("editor").getPublicUrl(fileName);

//       const quill = document.querySelector(".ql-editor");
//       const editor = (quill as any)?.__quill;
//       const range = editor?.getSelection();

//       if (editor && range) {
//         editor.insertEmbed(range.index, "image", data.publicUrl);
//       }
//     };
//   };

//   const modules = useMemo(
//     () => ({
//       toolbar: {
//         container: [
//           [{ font: [] }],
//           [{ header: [1, 2, 3, 4, 5, 6, false] }],
//           ["bold", "italic", "underline", "strike"],
//           [{ color: [] }],
//           [{ list: "ordered" }, { list: "bullet" }],
//           [{ align: [] }],
//           ["blockquote"],
//           ["link", "image"],
//           ["clean"],
//         ],
//         handlers: { image: handleImageUpload },
//       },
//     }),
//     []
//   );

//   return (
//     <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
//       <div className="max-w-full overflow-x-auto">
//         <ReactQuill
//           theme="snow"
//           value={value || ""}
//           onChange={(val: string) => onChange(cleanHtml(val))}
//           modules={modules}
//           placeholder={placeholder}
//         />
//       </div>
//     </div>
//   );
// }

"use client";
import dynamic from "next/dynamic";
import { useMemo } from "react";
import toast from "react-hot-toast";
import { uploadImage } from "@/libs/upload-image";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

type Props = {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
};

// Dipindah ke luar komponen biar gak ikut re-create tiap render
const handleImageUpload = (quill: any) => {
  // simpan posisi kursor sebelum dialog pilih file kebuka
  const range = quill.getSelection(true);
  const index = range ? range.index : quill.getLength();

  const input = document.createElement("input");
  input.setAttribute("type", "file");
  input.setAttribute("accept", "image/jpeg,image/png,image/webp,image/gif");
  input.click();

  input.onchange = async () => {
    const file = input.files?.[0];
    if (!file) return;

    try {
      // validasi, minta izin ke server, dan upload ada di uploadImage
      const url = await uploadImage(file);
      quill.insertEmbed(index, "image", url);
      quill.setSelection(index + 1);
    } catch (e: any) {
      console.error("UPLOAD IMAGE ERROR:", e);
      toast.error(e.message || "Gagal upload gambar, silakan coba lagi");
    }
  };
};

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "",
}: Props) {
  const cleanHtml = (html: string) => {
    return html
      .replace(/background-color:[^;"]+;?/gi, "")
      .replace(/color:[^;"]+;?/gi, "")
      .replace(/width:[^;"]+;?/gi, "")
      .replace(/height:[^;"]+;?/gi, "")
      .replace(/white-space:[^;"]+;?/gi, "")
      .replace(/style="[^"]*"/gi, "");
  };

  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ font: [] }],
          [{ header: [1, 2, 3, 4, 5, 6, false] }],
          ["bold", "italic", "underline", "strike"],
          [{ color: [] }],
          [{ list: "ordered" }, { list: "bullet" }],
          [{ align: [] }],
          ["blockquote"],
          ["link", "image"],
          ["clean"],
        ],
        handlers: {
          image: function (this: any) {
            handleImageUpload(this.quill);
          },
        },
      },
    }),
    [],
  );

  return (
    <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
      <div className="max-w-full overflow-x-auto">
        <ReactQuill
          theme="snow"
          value={value || ""}
          onChange={(val: string) => onChange(cleanHtml(val))}
          modules={modules}
          placeholder={placeholder}
        />
      </div>
    </div>
  );
}
