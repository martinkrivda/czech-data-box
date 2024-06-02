import { expect } from "chai";
import sinon from "sinon";
import ISDSSoapClient from "../src/lib/ISDSSoapClient.js";
import soap from "soap";

describe("ISDSSoapClient", function () {
  let soapClient;
  let createClientAsyncStub;
  let soapClientInstance;

  beforeEach(function () {
    createClientAsyncStub = sinon.stub(soap, "createClientAsync");
    soapClientInstance = {
      CreateMessageAsync: sinon.stub().resolves([
        {
          dmID: "messageID",
          dmStatus: { dmStatusCode: "0000", dmStatusMessage: "OK" },
        },
      ]),
      on: sinon.stub(),
      addHttpHeader: sinon.stub(),
      setEndpoint: sinon.stub(),
    };
    createClientAsyncStub.resolves(soapClientInstance);

    soapClient = new ISDSSoapClient(
      "wsdl_url",
      { login: "test", password: "test", location: "test_location" },
      false // Set debug to false for tests
    );
  });

  afterEach(function () {
    sinon.restore();
  });

  it("should initialize and make a request", async function () {
    await soapClient.init();
    const result = await soapClient.request("CreateMessage", {});

    expect(result).to.deep.equal([
      {
        dmID: "messageID",
        dmStatus: { dmStatusCode: "0000", dmStatusMessage: "OK" },
      },
    ]);
    expect(createClientAsyncStub.calledOnce).to.be.true;
    expect(soapClientInstance.CreateMessageAsync.calledOnceWith({})).to.be.true;
  });

  it("should not reinitialize the client if already initialized", async function () {
    await soapClient.init();
    await soapClient.request("CreateMessage", {});

    expect(createClientAsyncStub.calledOnce).to.be.true;
    expect(soapClientInstance.CreateMessageAsync.calledOnceWith({})).to.be.true;

    await soapClient.request("CreateMessage", {});
    expect(createClientAsyncStub.calledOnce).to.be.true; // Should still be called only once
    expect(soapClientInstance.CreateMessageAsync.calledTwice).to.be.true;
  });

  it("should throw an error if SOAP client initialization fails", async function () {
    createClientAsyncStub.rejects(
      new Error("SOAP client initialization failed")
    );

    try {
      await soapClient.init();
    } catch (error) {
      expect(error).to.be.an.instanceOf(Error);
      expect(error.message).to.equal("SOAP client initialization failed");
      return;
    }

    // If the code reaches here, the test should fail
    expect.fail("Expected an error but none was thrown");
  });

  // Add more test cases as needed
});
