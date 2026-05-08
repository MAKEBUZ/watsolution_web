import { type NoticiaCategory } from '@/shared/model/enumerations/noticia-category.model';
import { type NoticiaStatus } from '@/shared/model/enumerations/noticia-status.model';

export interface INoticia {
  id?: number;
  title?: string;
  summary?: string | null;
  content?: string | null;
  category?: keyof typeof NoticiaCategory | null;
  status?: keyof typeof NoticiaStatus | null;
  publishDate?: Date | null;
  imageUrl?: string | null;
}

export class Noticia implements INoticia {
  constructor(
    public id?: number,
    public title?: string,
    public summary?: string | null,
    public content?: string | null,
    public category?: keyof typeof NoticiaCategory | null,
    public status?: keyof typeof NoticiaStatus | null,
    public publishDate?: Date | null,
    public imageUrl?: string | null,
  ) {}
}
