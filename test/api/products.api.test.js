import Lab from "@hapi/lab";
import { expect } from "@hapi/code";
import Sinon from "sinon";
import jwt from "jsonwebtoken";
import { createServer } from '../../src/server.js';
import ProductsService from "../../src/services/ProductsService.js";
import NotFoundError from "../../src/exceptions/NotFoundError.js";
import Joi from "joi";

export const lab = Lab.script();
const { describe, it, beforeEach, afterEach } = lab;

describe("Products API", () => {
    let server;
    let sandbox;
    let adminToken;
    let productsServiceStub;

    beforeEach(async () => {
        sandbox = Sinon.createSandbox();
        productsServiceStub = sandbox.stub(ProductsService.prototype);

        const payload = {
            sub: "user-123",
            email: "admin@test.com",
            role: "ADMIN",
        };
        adminToken = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: "1h",
        });

        server = await createServer();
    });

    afterEach(async () => {
        sandbox.restore();
        await server.stop();
    });

    describe("GET /products", () => {
        it("should respond with 200 and a list of products", async () => {
            const mockProducts = [
                { id: 'prod-123', name: "Nasi Goreng" },
            ];
            productsServiceStub.getProducts.resolves(mockProducts);

            const res = await server.inject({
                method: "GET",
                url: "/products",
                headers: { Authorization: `Bearer ${adminToken}` },
            });
            const responsePayload = JSON.parse(res.payload);

            expect(res.statusCode).to.equal(200);
            expect(responsePayload.status).to.equal("success");
            expect(responsePayload.data.products).to.equal(mockProducts);
        });
    });

    describe("GET /products/{id}", () => {
        it("should respond with 404 if product is not found", async () => {
            const nonExistentId = "prod-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx";
            productsServiceStub.getProductById.rejects(new NotFoundError("Produk tidak ditemukan"));

            const res = await server.inject({
                method: "GET",
                url: `/products/${nonExistentId}`,
                headers: { Authorization: `Bearer ${adminToken}` },
            });
            const responsePayload = JSON.parse(res.payload);

            expect(res.statusCode).to.equal(404);
            expect(responsePayload.status).to.equal("fail");
            expect(responsePayload.message).to.equal("Produk tidak ditemukan");
        });

        it("should respond with 200 if product is found", async () => {
            const validId = "prod-abc-123";
            const mockProduct = { id: validId, name: "Tes Produk" };

            productsServiceStub.getProductById.resolves(mockProduct);

            const res = await server.inject({
                method: "GET",
                url: `/products/${validId}`,
                headers: { Authorization: `Bearer ${adminToken}` },
            });
            const responsePayload = JSON.parse(res.payload);

            expect(res.statusCode).to.equal(200);
            expect(responsePayload.status).to.equal("success");
            expect(responsePayload.data.product).to.equal(mockProduct);
        });
    });
});