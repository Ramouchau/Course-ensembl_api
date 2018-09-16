import { getConnection, Connection } from 'typeorm';
import { Socket } from 'socket.io';
import * as jwt from 'jsonwebtoken';
import {List} from "../entity/List";
import { CreateListResponse, CreateListRequest } from '../interfaces/list-interfaces';
import { Session } from '../interfaces/session';

export async function createList(data: CreateListRequest, socket: Socket) {
    const connection: Connection = getConnection();
    let response: CreateListResponse = { code: 200, status: "ok" };
		console.log(data)
    let user = new Session(data.token);
    socket.emit('create-list', response);
}