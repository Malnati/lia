import { useRef, useState } from 'react';

type Point = { x: number; y: number };

export function SignaturePad({ onSave }: { onSave: (blob: Blob) => void | Promise<void> }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [drawing, setDrawing] = useState(false);
  const [hasInk, setHasInk] = useState(false);

  function getPoint(event: React.PointerEvent<HTMLCanvasElement>): Point {
    const rect = event.currentTarget.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }

  function drawTo(point: Point) {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;
    context.lineWidth = 3;
    context.lineCap = 'round';
    context.strokeStyle = '#0f172a';
    context.lineTo(point.x, point.y);
    context.stroke();
    setHasInk(true);
  }

  function begin(event: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;
    const point = getPoint(event);
    event.currentTarget.setPointerCapture(event.pointerId);
    context.beginPath();
    context.moveTo(point.x, point.y);
    setDrawing(true);
  }

  function move(event: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawing) return;
    drawTo(getPoint(event));
  }

  function end() {
    setDrawing(false);
  }

  function clear() {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;
    context.clearRect(0, 0, canvas.width, canvas.height);
    setHasInk(false);
  }

  async function save() {
    const canvas = canvasRef.current;
    if (!canvas || !hasInk) return;
    canvas.toBlob(async (blob) => {
      if (blob) await onSave(blob);
    }, 'image/png');
  }

  return (
    <div className="signature-box">
      <canvas
        ref={canvasRef}
        width={520}
        height={180}
        aria-label="Assinatura do cliente"
        onPointerDown={begin}
        onPointerMove={move}
        onPointerUp={end}
        onPointerLeave={end}
      />
      <div className="signature-actions">
        <button type="button" onClick={clear}>Limpar assinatura</button>
        <button type="button" className="primary-button" onClick={save} disabled={!hasInk}>Salvar assinatura</button>
      </div>
    </div>
  );
}
