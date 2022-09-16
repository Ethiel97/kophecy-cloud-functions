export interface Quote {
    id: number,
    name: String,
    livre: String,
    author_id: number,
    tags: Tag[],
    body: String,
}

export interface Tag {
    id: number,
    name: String,
}