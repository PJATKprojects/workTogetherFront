import api from "./api";

export interface FileUploadResult {
  /** Site-relative URL: "/api/files/{storedName}". Prefix with the API origin to display. */
  url: string;
  fileName: string;
  size: number;
  contentType: string;
}

export const fileService = {
  /** Uploads an image/document; the server whitelists extensions and caps sizes. */
  upload: async (file: File) => {
    const form = new FormData();
    form.append("file", file);
    const response = await api.post<FileUploadResult>("/api/files", form);
    return response.data;
  },
};
