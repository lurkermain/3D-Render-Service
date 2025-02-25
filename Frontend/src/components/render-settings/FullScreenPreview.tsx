interface FullScreenPreviewProps {
  renderedImage: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function FullScreenPreview({
  renderedImage,
  isOpen,
  onClose,
}: FullScreenPreviewProps) {
  if (!isOpen || !renderedImage) return null;

  return (
    <div
      className="fixed inset-0 w-screen h-screen bg-black bg-opacity-50 flex items-center justify-center z-50"
      style={{ margin: 0 }}
      onClick={onClose}
    >
      <img
        src={renderedImage}
        alt="Full Screen Rendered Model"
        className="max-w-[90%] max-h-[80vh] object-contain"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
} 