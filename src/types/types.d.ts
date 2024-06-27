export type Candidate = {
    CodNuaCand: string | null;
    LibNuaCand: string | null;
    Elu: string | null;
};

export type Nuance = {
    libelle: string;
    codesMinistere: string[];
    nombreQualifies: number;
    couleur: string;
};

export type DataFile = {
    url: string;
    fetched: boolean;
};
