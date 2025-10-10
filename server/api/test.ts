export default function handler(req: any, res: any) {
  res.status(200).json({ 
    message: "Backend is working!",
    timestamp: new Date().toISOString()
  });
}
