import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import HLSVideoPlayer from "@/components/HLSVideoPlayer";

interface ProductVideoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  videoUrl: string;
  thumbnailUrl?: string;
  productName: string;
}

const ProductVideoModal = ({
  open,
  onOpenChange,
  videoUrl,
  thumbnailUrl,
  productName,
}: ProductVideoModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden">
        <DialogHeader className="p-4 pb-0">
          <DialogTitle>{productName}</DialogTitle>
        </DialogHeader>
        <div className="aspect-video w-full bg-black">
          <HLSVideoPlayer
            src={videoUrl}
            poster={thumbnailUrl}
            controls
            autoPlay
            className="w-full h-full"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductVideoModal;
