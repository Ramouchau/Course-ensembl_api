import { getConnection, Connection } from 'typeorm';
import { Socket } from 'socket.io';
import { List } from "../entity/List";
import { User } from '../entity/User';
import { Item } from '../entity/Item';
import {
	CreateListResponse,	CreateListRequest,
	addUserToListRequest, addUserToListResponce,
	addItemToListRequest, addItemToListResponce,
	updateItemRequest, updateItemResponce, ClientList,
	GetAllListResponce, GetAllListRequest
} from '../interfaces/list-interfaces';


// get-all-list
export async function getAllList(user: User, data: GetAllListRequest, socket: Socket) {
	let response: GetAllListResponce = { code: 200, status: "ok" };
	let userLists = user.owner_list.concat(user.users_list);

	response.lists  = userLists.map(list => {
		let clientlist: ClientList = { id: list.id, name: list.name};
		return clientlist;
	});

	socket.emit('get-all-list', response);
}

// create-list
export async function createList(user: User, data: CreateListRequest, socket: Socket) {
	const connection: Connection = getConnection();
	let response: CreateListResponse = { code: 200, status: "ok" };

	let list = new List();

	list.name = data.listName;
	list.owner = user;

	connection.manager.save(list).then(list => {
		response.idList = list.id;
		socket.emit('create-list', response);
	});
}

// add-user-to-list
export async function addUserToList(user: User, data: addUserToListRequest, socket: Socket) {
	const connection: Connection = getConnection();
	let response: addUserToListResponce = { code: 200, status: "ok" };
	let listRep = await connection.getRepository(List);
	let list = await listRep.findOne(data.idList);
	let userToAdd = await connection.getRepository(User).findOne(data.idUser);

	if (!list || userToAdd) {
		response.code = 404;
		response.status = "not found";
		socket.emit('add-user-to-list', response);
		return;
	}
	else if (list.owner.id != user.id) {
		response.code = 401;
		response.status = "unauthorized";
		socket.emit('add-user-to-list', response);
		return;
	}

	if (list.users.indexOf(userToAdd) > -1) {
		response.code = 400;
		response.status = "user aleready exist";
		socket.emit('add-user-to-list', response);
		return;
	}

	list.users.push(userToAdd);
	await listRep.save(list);
	socket.emit('add-user-to-list', response);
}

// add-item-to-list
export async function addItemToList(user: User, data: addItemToListRequest, socket: Socket) {
	const connection: Connection = getConnection();
	let response: addItemToListResponce = { code: 200, status: "ok" };
	let listRep = await connection.getRepository(List);
	let itemRep = await connection.getRepository(Item);
	let list = await listRep.findOne(data.idList);

	if (!list) {
		response.code = 404;
		response.status = "not found";
		socket.emit('add-item-to-list', response);
		return;
	}
	else if (list.users.indexOf(user) == -1 && list.owner != user) {
		response.code = 401;
		response.status = "unauthorized";
		socket.emit('add-item-to-list', response);
		return;
	}

	let item = new Item();

	item.name = data.item.name;
	item.quantity = data.item.quantity;
	item.status = data.item.status;
	item.addBy = user;
	item.list = list;
	await itemRep.save(item);
	socket.emit('add-item-to-list', response);
}

// update-item
export async function updateItem(user: User, data: updateItemRequest, socket: Socket) {
	const connection: Connection = getConnection();
	let response: updateItemResponce = { code: 200, status: "ok" };
	let itemRep = await connection.getRepository(Item);
	let item = await itemRep.findOne(data.idItem);

	if (!item) {
		response.code = 404;
		response.status = "not found";
		socket.emit('update-item', response);
		return;
	}
	else if (item.list.users.indexOf(user) == -1 && item.list.owner != user) {
		response.code = 401;
		response.status = "unauthorized";
		socket.emit('update-item', response);
		return;
	}

	item.name = data.item.name;
	item.quantity = data.item.quantity;
	item.status = data.item.status;
	await itemRep.save(item);
	socket.emit('update-item', response);
}

/*export async function updateItemStatus(user: User, data: updateItemStatusRequest, socket: Socket) {
	const connection: Connection = getConnection();
	let response: updateItemResponce = { code: 200, status: "ok" };
	let itemRep = await connection.getRepository(Item);
	let item = await itemRep.findOne(data.idItem);

	if (!item) {
		response.code = 404;
		response.status = "not found";
		socket.emit('update-item', response);
		return;
	}
	else if (item.list.users.indexOf(user) == -1 && item.list.owner != user) {
		response.code = 401;
		response.status = "unauthorized";
		socket.emit('update-item', response);
		return;
	}

	await itemRep.save(item);
	socket.emit('update-item', response);
}*/