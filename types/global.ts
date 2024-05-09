import type { FastifyRequest, FastifyReply } from 'fastify';

interface FilesInRequest {
    file: GledeReqFile;
    files: FilesInRequest;
}

declare global {
    type GledeRequest = FastifyRequest & FilesInRequest;
    type GledeReply = FastifyReply & FilesInRequest;
}