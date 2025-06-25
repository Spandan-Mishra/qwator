export interface Task {
    id: number;
    title: string;
    options: Option[];
}

export interface Option {
    id: string;
    image_url: string;
    task_id: number;
}