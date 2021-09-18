import * as THREE from 'three';
export default class ThreeSpritePlayer {
    protected tiles: THREE.Texture[];
    protected totalFrame: number;
    protected row: number;
    protected col: number;
    protected currFrame: number;
    protected frameGap: number;
    protected startTime?: number;
    protected startFrame?: number;
    playing: boolean;
    currTile: number;
    currTileOffset: number;
    mesh?: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;
    constructor(tiles: THREE.Texture[], totalFrame: number, row: number, col: number, fps?: number, sRGB?: boolean);
    stop(): void;
    play(): void;
    get texture(): THREE.Texture;
    animate(): void;
    protected updateOffset(): void;
    dispose(): void;
}
