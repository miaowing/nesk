import * as sinon from 'sinon';
import { expect } from 'chai';
import { RoutesResolver } from '../../router/routes-resolver';
import { Controller } from '../../../common/decorators/core/controller.decorator';
import { RequestMapping } from '../../../common/decorators/http/request-mapping.decorator';
import { RequestMethod } from '../../../common/enums/request-method.enum';
import { ApplicationConfig } from '../../application-config';
import { BadRequestException } from '@neskjs/common';

describe('RoutesResolver', () => {
  @Controller('global')
  class TestRoute {
    @RequestMapping({ path: 'test' })
    public getTest() {}

    @RequestMapping({ path: 'another-test', method: RequestMethod.POST })
    public anotherTest() {}
  }

  let router;
  let routesResolver: RoutesResolver;
  let container;
  let modules: Map<string, any>;

  before(() => {
    modules = new Map();
    container = {
      getModules: () => modules,
    };
    router = {
      get() {},
      post() {},
    };
  });

  beforeEach(() => {
    routesResolver = new RoutesResolver(
      container,
      {
        createRouter: () => router,
      },
      new ApplicationConfig(),
    );
  });

  describe('setupRouters', () => {
    it('should method setup controllers to router instance', () => {
      const routes = new Map();
      routes.set('TestRoute', {
        instance: new TestRoute(),
        metatype: TestRoute,
      });

      const use = sinon.spy();
      routesResolver.setupRouters(routes, '', undefined, { use } as any);
      expect(use.calledWith('/global', router)).to.be.true;
    });
  });

  describe('resolve', () => {
    it('should call "setupRouters" for each module', () => {
      const routes = new Map();
      routes.set('TestRoute', {
        instance: new TestRoute(),
        metatype: TestRoute,
      });
      modules.set('TestModule', { routes });
      modules.set('TestModule2', { routes });

      const spy = sinon
        .stub(routesResolver, 'setupRouters')
        .callsFake(() => undefined);
      routesResolver.resolve({ use: sinon.spy() } as any, { use: sinon.spy() } as any);
      expect(spy.calledTwice).to.be.true;
    });
  });

  describe('mapExternalExceptions', () => {
    describe('when exception prototype is', () => {
      describe('SyntaxError', () => {
        it('should map to BadRequestException', () => {
          const err = new SyntaxError();
          const outputErr = routesResolver.mapExternalException(err);
          expect(outputErr).to.be.instanceof(BadRequestException);
        });
      });
      describe('other', () => {
        it('should behave as an identity', () => {
          const err = new Error();
          const outputErr = routesResolver.mapExternalException(err);
          expect(outputErr).to.be.eql(err);
        });
      });
    });
  });
});
