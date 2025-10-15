import { useEffect, useState } from "react";
import { useRoute } from "wouter";
import { CheckCircle2, Clock, XCircle, AlertCircle, Phone, Mail, FileText } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface TimelineItem {
  status: string;
  timestamp: Date;
  description: string;
}

interface AgentInfo {
  name: string;
  phone: string;
  email: string;
}

interface TrackingInfo {
  applicationId: string;
  status: string;
  currentStep: string;
  createdAt: Date;
  lastUpdated: Date;
  pendingDocuments: string[];
  assignedAgent?: AgentInfo;
  timeline: TimelineItem[];
}

export default function TrackingPage() {
  const [, params] = useRoute("/seguimiento/:token");
  const token = params?.token;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trackingInfo, setTrackingInfo] = useState<TrackingInfo | null>(null);

  useEffect(() => {
    if (!token) {
      setError("Token no proporcionado");
      setLoading(false);
      return;
    }

    fetchTrackingInfo(token);
  }, [token]);

  const fetchTrackingInfo = async (token: string) => {
    try {
      setLoading(true);
      setError(null);

      // Llamar al endpoint de Firebase Functions
      const response = await fetch(
        `https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net/getApplicationStatus?token=${token}`
      );

      if (!response.ok) {
        throw new Error("Token inválido o expirado");
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Error al obtener información");
      }

      // Convertir fechas
      const info: TrackingInfo = {
        ...data.data,
        createdAt: new Date(data.data.createdAt),
        lastUpdated: new Date(data.data.lastUpdated),
        timeline: data.data.timeline.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp),
        })),
      };

      setTrackingInfo(info);
    } catch (err: any) {
      console.error("Error fetching tracking info:", err);
      setError(err.message || "Error al cargar la información");
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
      case "disbursed":
        return <CheckCircle2 className="w-6 h-6 text-green-500" />;
      case "rejected":
        return <XCircle className="w-6 h-6 text-red-500" />;
      case "observed":
        return <AlertCircle className="w-6 h-6 text-yellow-500" />;
      default:
        return <Clock className="w-6 h-6 text-blue-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
      case "disbursed":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "observed":
        return "bg-yellow-100 text-yellow-800";
      case "in_review":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: "Pendiente",
      received: "Recibida",
      routed: "En Proceso",
      in_review: "En Revisión",
      decision: "En Evaluación",
      approved: "Aprobada",
      rejected: "No Aprobada",
      observed: "Requiere Información",
      disbursed: "Desembolsada",
    };
    return labels[status] || status;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  if (error || !trackingInfo) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error || "No se pudo cargar la información de seguimiento"}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Seguimiento de Solicitud</h1>
          <p className="text-gray-600">ID: {trackingInfo.applicationId.slice(-8)}</p>
        </div>

        {/* Estado Actual */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getStatusIcon(trackingInfo.status)}
                <div>
                  <CardTitle>Estado Actual</CardTitle>
                  <CardDescription>
                    Última actualización: {trackingInfo.lastUpdated.toLocaleDateString("es-PE")}
                  </CardDescription>
                </div>
              </div>
              <Badge className={getStatusColor(trackingInfo.status)}>
                {getStatusLabel(trackingInfo.status)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Etapa Actual</p>
                <p className="font-medium">{trackingInfo.currentStep}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Fecha de Solicitud</p>
                <p className="font-medium">{trackingInfo.createdAt.toLocaleDateString("es-PE")}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Documentos Pendientes */}
        {trackingInfo.pendingDocuments.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Documentos Pendientes
              </CardTitle>
              <CardDescription>
                Necesitamos los siguientes documentos para continuar con tu solicitud
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {trackingInfo.pendingDocuments.map((doc, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-yellow-500" />
                    <span>{doc}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Información del Asesor */}
        {trackingInfo.assignedAgent && (
          <Card>
            <CardHeader>
              <CardTitle>Tu Asesor Asignado</CardTitle>
              <CardDescription>Puedes contactar a tu asesor para cualquier consulta</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Nombre</p>
                  <p className="font-medium">{trackingInfo.assignedAgent.name}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-600" />
                  <a
                    href={`tel:${trackingInfo.assignedAgent.phone}`}
                    className="text-blue-600 hover:underline"
                  >
                    {trackingInfo.assignedAgent.phone}
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-600" />
                  <a
                    href={`mailto:${trackingInfo.assignedAgent.email}`}
                    className="text-blue-600 hover:underline"
                  >
                    {trackingInfo.assignedAgent.email}
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Historial de la Solicitud</CardTitle>
            <CardDescription>Seguimiento detallado de tu proceso</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {trackingInfo.timeline.map((item, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        index === 0 ? "bg-blue-500" : "bg-gray-300"
                      }`}
                    />
                    {index < trackingInfo.timeline.length - 1 && (
                      <div className="w-0.5 h-full bg-gray-300 my-1" />
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <p className="font-medium">{item.description}</p>
                    <p className="text-sm text-gray-600">
                      {item.timestamp.toLocaleString("es-PE", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Nota de Seguridad */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Este link de seguimiento es personal y tiene una validez de 24 horas. No lo compartas con
            terceros.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}

