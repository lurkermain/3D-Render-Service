import { Button } from "./button";
import { Save, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./alert-dialog";
import { useState } from "react";

interface ActionButtonsProps {
  onSave: () => void;
  onDelete?: () => void;
  onClose: () => void;
  showDelete?: boolean;
}

export function ActionButtons({ onSave, onDelete, onClose, showDelete = true }: ActionButtonsProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  return (
    <div className="flex items-center">
      <Button onClick={onSave} variant="default" size="sm">
        <Save className="h-4 w-4" />
        Сохранить
      </Button>

      {showDelete && (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                className="text-destructive cursor-pointer"
                onClick={() => setShowDeleteDialog(true)}
              >
                Удалить
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Удаление товара</AlertDialogTitle>
                <AlertDialogDescription>
                  Вы уверены, что хотите удалить этот товар? Это действие нельзя отменить.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Отмена</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={() => {
                    onDelete?.();
                    setShowDeleteDialog(false);
                  }}
                >
                  Удалить
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}

      <div
        className={`inline-flex items-center justify-center hover:bg-accent hover:text-accent-foreground focus:outline-none h-9 rounded-md px-3 ${
          showDelete ? "-ml-3" : ""
        }`}
        onClick={onClose}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="lucide lucide-x"
        >
          <path d="M18 6 6 18" />
          <path d="m6 6 12 12" />
        </svg>
      </div>
    </div>
  );
} 