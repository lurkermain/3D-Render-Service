interface RenderPreviewProps {
  renderedImage: string | null;
  isRendering: boolean;
  isFirstRender: boolean;
  onImageClick: () => void;
}

export function RenderPreview({
  renderedImage,
  isRendering,
  isFirstRender,
  onImageClick,
}: RenderPreviewProps) {
  if (isRendering && isFirstRender) {
    return (
      <div className="w-16 h-16 relative">
        <div className="absolute inset-0 rounded-full animate-spin border-4 border-t-black border-solid"></div>
      </div>
    );
  }

  if (renderedImage) {
    return (
      <img
        src={renderedImage}
        alt="Rendered Model"
        onClick={onImageClick}
        className="max-w-full max-h-[300px] object-contain cursor-pointer rounded"
      />
    );
  }

  return null;
} 