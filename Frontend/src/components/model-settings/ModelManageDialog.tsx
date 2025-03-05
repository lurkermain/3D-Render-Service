"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Model {
  id: number
  modelType: string
  file: File
}

interface ModelManageDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  model?: Model
  onSave: (model: { id?: number; name: string; file?: File; isGlb: boolean }) => void
  // onDelete?: () => void
}

export function ModelManageDialog({ open, onOpenChange, model, onSave }: ModelManageDialogProps) {
  const [modelName, setModelName] = useState(model?.modelType || "")
  const [modelFile, setModelFile] = useState<File | null>(null)
  const [isGlb, setIsGlb] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setModelFile(selectedFile)
      // Проверяем расширение файла
      const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase()
      setIsGlb(fileExtension === 'glb')
    }
  }

  useEffect(() => {
    setModelName(model?.modelType || "")
  }, [model])

  const handleSave = () => {
    if (!modelName || (!modelFile && !model)) {
      alert("Введите название модели и выберите файл!")
      return
    }
    onSave({
      id: model?.id,
      name: modelName,
      file: modelFile || model?.file,
      isGlb: isGlb
    })
    onOpenChange(false)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{model ? "Редактирование модели" : "Создание модели"}</DialogTitle>
          </DialogHeader>
          <div>
            <div className="space-y-4 py-2 pb-4">
              <div className="space-y-2">
                <Label htmlFor="name">Название модели</Label>
                <Input id="name" value={modelName} onChange={(e) => setModelName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="file">Файл модели </Label>
                <Input
                  id="file"
                  type="file"
                  accept=".blend,.fbx,.obj,.stl,.dae,.3ds,.gltf,.glb,.ply,.max,.ma,.mb,.lwo,.lws,.x3d,.x3dz,.collada"
                  onChange={handleFileChange}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Отмена
            </Button>
            <Button onClick={handleSave}>
              Сохранить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}