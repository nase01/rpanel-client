import { useRef, useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle
} from "@/components/ui/dialog";
import { useModalIsLoading, useModalFileUploadIsOpen } from "@/components/ToggleProvider";
import toast from "react-hot-toast";
import { toastConfig } from "@/constants";
import { useUploadFile } from "@/lib/react-query/queries";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Paperclip } from "lucide-react";

interface ModalFileUploadProps {
	setFileUploaded: React.Dispatch<React.SetStateAction<string>>;
}

const ModalFileUpload = ({ setFileUploaded }: ModalFileUploadProps) => {
	const { modalFileUploadIsOpen, setModalFileUploadIsOpen } = useModalFileUploadIsOpen();
  const { modalIsLoading, setModalIsLoading } = useModalIsLoading();

	const [file, setFile] = useState<File | null>(null);
	const fileInputRef = useRef<HTMLInputElement | null>(null);
	const { mutateAsync: uploadFile, isPending } = useUploadFile();

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const selectedFile = e.target.files?.[0];
		if (selectedFile) {
			setFile(selectedFile);
		}
	};

	const handleUpload = async () => {
		if (file) {
			setModalIsLoading(true)
			const response = await uploadFile(file);
			if (response?.errors) {
				toast.error(response.errors[0].detail, toastConfig);
				return;
			}
			setModalIsLoading(false)
			setModalFileUploadIsOpen(false)
			setFileUploaded(response.data[0].fileUrl);
			setFile(null);

			// Clear the file input
			if (fileInputRef.current) {
				fileInputRef.current.value = "";
			}

			toast.success("File successfully uploaded", toastConfig);
		} else {
			toast.error("Please choose a file to upload", toastConfig);
		}
	};

  return (
    <Dialog open={modalFileUploadIsOpen} onOpenChange={(open: boolean | ((prevState: boolean) => boolean)) => !modalIsLoading && setModalFileUploadIsOpen(open)}>
      <DialogContent aria-describedby={undefined} className="max-h-full overflow-y-auto my-3">
        <DialogHeader>
          <DialogTitle>
            Upload File
          </DialogTitle>
        </DialogHeader>
				<div className="my-3">
					<div className="w-full">
						<div className="flex justify-start items-center gap-2">
							<Input
								ref={fileInputRef} // Attach the ref here
								className="file:text-muted-foreground"
								id="fileAttachment"
								type="file"
								onChange={handleFileChange}
							/>
							<Button
								type="button"
								variant="secondary"
								onClick={handleUpload}
								disabled={isPending}
							>
								<Paperclip className="h-4 w-auto mr-2" /> {isPending ? "Uploading..." : "Upload"}
							</Button>
						</div>
						<div className="my-3 p-1 text-sm border-l-4 border-yellow-500 text-yellow-700">
							Format: jpg, png or gif with 5mb limit
						</div>
					</div>
				</div>
      </DialogContent>
    </Dialog>
  )
}

export default ModalFileUpload