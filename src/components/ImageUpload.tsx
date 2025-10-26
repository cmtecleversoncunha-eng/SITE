'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  placeholder?: string;
  className?: string;
}

export function ImageUpload({ value, onChange, placeholder, className }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(value || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Erro",
        description: "Tipo de arquivo não permitido. Use JPEG, PNG, WebP ou GIF.",
        variant: "destructive",
      });
      return;
    }

    // Validar tamanho (máximo 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast({
        title: "Erro",
        description: "Arquivo muito grande. Máximo 5MB.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'products');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setPreview(result.url);
        onChange(result.url);
        toast({
          title: "Sucesso",
          description: "Imagem enviada com sucesso!",
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      console.error('Erro no upload:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao enviar imagem",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setPreview(null);
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const url = event.target.value;
    setPreview(url);
    onChange(url);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <Label>Imagem do Produto</Label>
      
      {/* Preview da imagem */}
      {preview && (
        <div className="relative w-full h-48 border rounded-lg overflow-hidden bg-gray-100">
          <Image
            src={preview}
            alt="Preview"
            fill
            className="object-cover"
            onError={() => setPreview(null)}
          />
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2"
            onClick={handleRemoveImage}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Upload de arquivo */}
      <div className="space-y-2">
        <Label htmlFor="file-upload">Enviar arquivo</Label>
        <div className="flex items-center gap-2">
          <Input
            ref={fileInputRef}
            id="file-upload"
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            disabled={uploading}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2"
          >
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                Enviando...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Escolher arquivo
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Ou inserir URL */}
      <div className="space-y-2">
        <Label htmlFor="image-url">Ou inserir URL</Label>
        <div className="flex items-center gap-2">
          <Input
            id="image-url"
            type="url"
            placeholder={placeholder || "https://exemplo.com/imagem.jpg"}
            value={preview || ''}
            onChange={handleUrlChange}
            className="flex-1"
          />
          {preview && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => window.open(preview, '_blank')}
              className="flex items-center gap-1"
            >
              <ImageIcon className="h-4 w-4" />
              Ver
            </Button>
          )}
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        Formatos aceitos: JPEG, PNG, WebP, GIF. Tamanho máximo: 5MB.
      </p>
    </div>
  );
}

