import fs from 'fs';
import path from 'path';
import { ProjectMeta } from './types';

const projectsDir = path.join(process.cwd(), 'content/projects');

export function loadProjects(): ProjectMeta[] {
  const indexPath = path.join(projectsDir, 'index.json');
  const raw = fs.readFileSync(indexPath, 'utf-8');
  return JSON.parse(raw) as ProjectMeta[];
}

export function getProjectSlugs(): string[] {
  return loadProjects().map((p) => p.slug);
}

export function getProjectBySlug(slug: string): ProjectMeta | undefined {
  return loadProjects().find((p) => p.slug === slug);
}
