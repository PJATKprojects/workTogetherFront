export interface Status {
  id: number;
  statusName: string;
}

export interface Role {
  id: number;
  name: string;
}

export interface Technology {
  id: number;
  name: string;
}

export interface PositionTechnology {
  projectPositionId: number;
  technologiesId: number;
  technology?: Technology;
}
