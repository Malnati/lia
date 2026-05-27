import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { canTransitionOrder } from './order-status';
import { Order, type OrderDocument } from './schemas/order.schema';

@Injectable()
export class OrdersService {
  constructor(@InjectModel(Order.name) private readonly orderModel: Model<OrderDocument>) {}

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    const order = new this.orderModel({
      customerName: createOrderDto.customerName,
      customerPhone: createOrderDto.customerPhone,
      deliveryAddress: createOrderDto.deliveryAddress,
      product: createOrderDto.product ?? 'Molde prótese',
      notes: createOrderDto.notes ?? '',
      pendingSync: createOrderDto.pendingSync ?? false,
      checkpoints: [
        { key: 'pickup_checkin', label: 'Retirada check-in', completed: false },
        { key: 'pickup_checkout', label: 'Retirada check-out', completed: false },
        { key: 'delivery_checkin', label: 'Entrega check-in', completed: false },
        { key: 'delivery_checkout', label: 'Entrega check-out', completed: false }
      ]
    });

    return order.save();
  }

  async findAll(): Promise<Order[]> {
    return this.orderModel.find().sort({ createdAt: -1 }).exec();
  }

  async updateStatus(id: string, updateOrderStatusDto: UpdateOrderStatusDto): Promise<Order> {
    const order = await this.orderModel.findById(id).exec();

    if (!order) {
      throw new NotFoundException(`Order ${id} not found`);
    }

    if (!canTransitionOrder(order.status, updateOrderStatusDto.status)) {
      throw new BadRequestException(
        `Cannot transition order ${id} from ${order.status} to ${updateOrderStatusDto.status}`
      );
    }

    order.status = updateOrderStatusDto.status;
    return order.save();
  }
}
