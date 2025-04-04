"use client";

import { useState } from "react";
import { Check, ChevronsUpDown, MoreVertical, Pencil, Trash, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { BlenderModel } from "@/lib/types";

interface ModelSwitcherProps {
  models: BlenderModel[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  onAddModel?: () => void;
  onEditModel?: (id: number) => void;
  onDeleteModel?: (id: number) => void;
  showModelActions?: boolean;
}

export function ModelSwitcher({
  models,
  value,
  onValueChange,
  placeholder = "Выберите 3D модель",
  onAddModel,
  onEditModel,
  onDeleteModel,
  showModelActions = false,
}: ModelSwitcherProps) {
  const [open, setOpen] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [modelToDelete, setModelToDelete] = useState<BlenderModel | null>(null);

  const handleDeleteClick = (model: BlenderModel) => {
    setModelToDelete(model);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    if (modelToDelete && onDeleteModel) {
      onDeleteModel(modelToDelete.id);
    }
    setShowDeleteDialog(false);
    setModelToDelete(null);
  };

  const selectedModel = models.find((model) => model.modelType === value);

  return (
    <>
      <Popover open={open} onOpenChange={setOpen} >
        <PopoverTrigger asChild>
          <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between overflow-hidden">
            <div className="flex items-center truncate max-w-[calc(100%-20px)] overflow-hidden">
              {selectedModel ? (
                <>
                  <span className="truncate max-w-[150px] overflow-hidden text-ellipsis">{selectedModel.modelType}</span>
                  {selectedModel.isGlb && (
                    <Badge variant="outline" className="ml-2 text-xs truncate flex-shrink-0">
                      glb
                    </Badge>
                  )}
                </>
              ) : (
                <span className="text-muted-foreground truncate">{placeholder}</span>
              )}
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent side="bottom" className="w-full p-0 max-h-[50vh] ">
        <Command>
            <CommandInput placeholder={placeholder} />
            <CommandList>
              <CommandEmpty>Модели не найдены</CommandEmpty>
              <CommandGroup className="overflow-y-auto max-h-60 sm:max-h-64">
                {models.map((model) => (
                  <CommandItem
                    key={model.id}
                    onSelect={() => {
                      onValueChange(model.modelType);
                      setOpen(false);
                    }}
                    className="flex justify-between overflow-hidden"
                  >
                    <div className="flex items-center max-w-[calc(100%-40px)] overflow-hidden">
                      <Check className={cn("mr-2 h-4 w-4 flex-shrink-0", value === model.modelType ? "opacity-100" : "opacity-0")} />
                      <div className="flex items-center overflow-hidden">
                        <span className="truncate max-w-[150px] overflow-hidden text-ellipsis">{model.modelType}</span>
                        {model.isGlb && (
                          <Badge variant="outline" className="ml-2 text-xs truncate flex-shrink-0">glb</Badge>
                        )}
                      </div>
                    </div>
                    {showModelActions && (onEditModel || onDeleteModel) && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 p-0 hover:bg-transparent ml-2 flex-shrink-0"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-32">
                          {onEditModel && (
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              onEditModel(model.id);
                            }}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Изменить
                            </DropdownMenuItem>
                          )}
                          {onDeleteModel && (
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteClick(model);
                            }} className="text-red-600">
                              <Trash className="mr-2 h-4 w-4" />
                              Удалить
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
            {showModelActions && onAddModel && (
              <>
                <CommandSeparator />
                <CommandList>
                  <CommandGroup>
                    <CommandItem onSelect={onAddModel}>
                      <Plus className="mr-2 h-4 w-4" />
                      Добавить модель
                    </CommandItem>
                  </CommandGroup>
                </CommandList>
              </>
            )}
          </Command>
        </PopoverContent>
      </Popover>
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удаление модели</AlertDialogTitle>
            <AlertDialogDescription>Вы уверены, что хотите удалить эту модель? Это действие нельзя отменить.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700">Удалить</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
