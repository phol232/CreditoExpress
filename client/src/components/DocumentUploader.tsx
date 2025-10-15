import { useState, useCallback } from "react";
import { Upload, X, FileText, Image as ImageIcon, CheckCircle2, AlertCircle } from "lucide-react";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { Alert, AlertDescription } from "./ui/alert";

export interface UploadedDocument {
  id: string;
  name: string;
  url: string;
  type: "dni_front" | "dni_back" | "income_proof" | "address_proof" | "other";
  size: number;
  uploadedAt: Date;
}

interface DocumentUploaderProps {
  microfinancieraId: string;
  applicationId: string;
  onDocumentsChange: (documents: UploadedDocument[]) => void;
  maxFiles?: number;
  maxSizeMB?: number;
}

const DOCUMENT_TYPES = [
  { value: "dni_front", label: "DNI (Frente)" },
  { value: "dni_back", label: "DNI (Reverso)" },
  { value: "income_proof", label: "Comprobante de Ingresos" },
  { value: "address_proof", label: "Comprobante de Domicilio" },
  { value: "other", label: "Otro" },
];

export default function DocumentUploader({
  microfinancieraId,
  applicationId,
  onDocumentsChange,
  maxFiles = 5,
  maxSizeMB = 5,
}: DocumentUploaderProps) {
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const validateFile = (file: File): string | null => {
    // Validar tamaño
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return `El archivo ${file.name} excede el tamaño máximo de ${maxSizeMB}MB`;
    }

    // Validar tipo
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];
    if (!validTypes.includes(file.type)) {
      return `El archivo ${file.name} no es un tipo válido (solo PDF, JPG, PNG)`;
    }

    return null;
  };

  const uploadFile = async (file: File, docType: string): Promise<UploadedDocument> => {
    const storage = getStorage();
    const timestamp = Date.now();
    const fileName = `${docType}_${timestamp}_${file.name}`;
    const storageRef = ref(
      storage,
      `microfinancieras/${microfinancieraId}/applications/${applicationId}/${fileName}`
    );

    return new Promise((resolve, reject) => {
      const uploadTask = uploadBytesResumable(storageRef, file, {
        customMetadata: {
          uploadedBy: "user", // TODO: Get from auth context
          originalName: file.name,
          documentType: docType,
        },
      });

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (error) => {
          console.error("Error uploading file:", error);
          reject(error);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve({
            id: timestamp.toString(),
            name: file.name,
            url: downloadURL,
            type: docType as any,
            size: file.size,
            uploadedAt: new Date(),
          });
        }
      );
    });
  };

  const handleFileSelect = async (files: FileList | null, docType: string) => {
    if (!files || files.length === 0) return;

    setError(null);

    // Validar número máximo de archivos
    if (documents.length + files.length > maxFiles) {
      setError(`Solo puedes subir un máximo de ${maxFiles} archivos`);
      return;
    }

    setUploading(true);

    try {
      const uploadPromises: Promise<UploadedDocument>[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Validar archivo
        const validationError = validateFile(file);
        if (validationError) {
          setError(validationError);
          continue;
        }

        uploadPromises.push(uploadFile(file, docType));
      }

      const uploadedDocs = await Promise.all(uploadPromises);
      const newDocuments = [...documents, ...uploadedDocs];

      setDocuments(newDocuments);
      onDocumentsChange(newDocuments);
      setUploadProgress(0);
    } catch (err: any) {
      console.error("Error uploading files:", err);
      setError(err.message || "Error al subir archivos");
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleFileSelect(e.dataTransfer.files, "other");
      }
    },
    [documents]
  );

  const removeDocument = (id: string) => {
    const newDocuments = documents.filter((doc) => doc.id !== id);
    setDocuments(newDocuments);
    onDocumentsChange(newDocuments);
  };

  const getFileIcon = (fileName: string) => {
    if (fileName.toLowerCase().endsWith(".pdf")) {
      return <FileText className="w-8 h-8 text-red-500" />;
    }
    return <ImageIcon className="w-8 h-8 text-blue-500" />;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <div className="space-y-4">
      {/* Área de carga */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 hover:border-gray-400"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <p className="text-lg font-medium mb-2">
          Arrastra archivos aquí o selecciona tipo de documento
        </p>
        <p className="text-sm text-gray-500 mb-4">
          Formatos: PDF, JPG, PNG (máx. {maxSizeMB}MB por archivo)
        </p>

        <div className="flex flex-wrap gap-2 justify-center">
          {DOCUMENT_TYPES.map((type) => (
            <label key={type.value} className="cursor-pointer">
              <input
                type="file"
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => handleFileSelect(e.target.files, type.value)}
                disabled={uploading || documents.length >= maxFiles}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={uploading || documents.length >= maxFiles}
                onClick={(e) => {
                  e.preventDefault();
                  (e.currentTarget.previousElementSibling as HTMLInputElement)?.click();
                }}
              >
                {type.label}
              </Button>
            </label>
          ))}
        </div>
      </div>

      {/* Progreso de carga */}
      {uploading && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Subiendo archivo...</span>
            <span>{Math.round(uploadProgress)}%</span>
          </div>
          <Progress value={uploadProgress} />
        </div>
      )}

      {/* Errores */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Lista de documentos subidos */}
      {documents.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            Documentos subidos ({documents.length}/{maxFiles})
          </h4>

          <div className="space-y-2">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border"
              >
                {getFileIcon(doc.name)}
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{doc.name}</p>
                  <p className="text-sm text-gray-500">
                    {formatFileSize(doc.size)} •{" "}
                    {DOCUMENT_TYPES.find((t) => t.value === doc.type)?.label || doc.type}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeDocument(doc.id)}
                  disabled={uploading}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mensaje de requisitos mínimos */}
      {documents.length < 2 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Debes subir al menos 2 documentos para continuar (DNI frente y reverso recomendados)
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

