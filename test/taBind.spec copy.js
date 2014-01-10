describe('minimum date of 2013-01-10T12:30 - minute granularity', function () {
  'use strict';
  var $rootScope, element;
  beforeEach(module('ui.bootstrap.datetimepicker'));
  beforeEach(inject(function (_$compile_, _$rootScope_) {
    $rootScope = _$rootScope_;
    $rootScope.date = moment("2013-01-22T12:00:00.000").toDate();
    element = _$compile_('<datetimepicker data-datetimepicker-config="{ startView: \'minute\', minDate: \'2013-01-22T12:30\'}" data-ng-model="date"></datetimepicker>')($rootScope);
    $rootScope.$digest();
  }));
  it('has 6 `.disabled` elements', function () {
    expect(jQuery('.disabled', element).length).toBe(6);
  });
  it('last `.disabled` element should be 2013-01-22T12:25', function () {
    expect(jQuery('.disabled', element).last().text()).toBe('12:25');
  });
});

describe('maximum date of 2013-01-10T12:30 - minute granularity', function () {
  'use strict';
  var $rootScope, element;
  beforeEach(module('ui.bootstrap.datetimepicker'));
  beforeEach(inject(function (_$compile_, _$rootScope_) {
    $rootScope = _$rootScope_;
    $rootScope.date = moment("2013-01-22T12:00:00.000").toDate();
    element = _$compile_('<datetimepicker data-datetimepicker-config="{ startView: \'minute\', maxDate: \'2013-01-22T12:30\'}" data-ng-model="date"></datetimepicker>')($rootScope);
    $rootScope.$digest();
  }));
  it('has 5 `.disabled` elements', function () {
    expect(jQuery('.disabled', element).length).toBe(5);
  });
  it('first `.disabled` element should be 2013-01-22T12:35', function () {
    expect(jQuery('.disabled', element).first().text()).toBe('12:35');
  });
});

describe('minimum date of 2013-01-10T12:30 - hour granularity', function () {
  'use strict';
  var $rootScope, element;
  beforeEach(module('ui.bootstrap.datetimepicker'));
  beforeEach(inject(function (_$compile_, _$rootScope_) {
    $rootScope = _$rootScope_;
    $rootScope.date = moment("2013-01-22T12:00:00.000").toDate();
    element = _$compile_('<datetimepicker data-datetimepicker-config="{ startView: \'hour\', minDate: \'2013-01-22T12:30\'}" data-ng-model="date"></datetimepicker>')($rootScope);
    $rootScope.$digest();
  }));
  it('has 12 `.disabled` elements', function () {
    expect(jQuery('.disabled', element).length).toBe(12);
  });
  it('last `.disabled` element should be 2013-01-22T11:00', function () {
    expect(jQuery('.disabled', element).last().text()).toBe('11:00');
  });
});

describe('maximum date of 2013-01-10T12:30 - hour granularity', function () {
  'use strict';
  var $rootScope, element;
  beforeEach(module('ui.bootstrap.datetimepicker'));
  beforeEach(inject(function (_$compile_, _$rootScope_) {
    $rootScope = _$rootScope_;
    $rootScope.date = moment("2013-01-22T12:00:00.000").toDate();
    element = _$compile_('<datetimepicker data-datetimepicker-config="{ startView: \'hour\', maxDate: \'2013-01-22T12:30\'}" data-ng-model="date"></datetimepicker>')($rootScope);
    $rootScope.$digest();
  }));
  it('has 11 `.disabled` elements', function () {
    expect(jQuery('.disabled', element).length).toBe(11);
  });
  it('first `.disabled` element should be 2013-01-22T13:00', function () {
    expect(jQuery('.disabled', element).first().text()).toBe('13:00');
  });
});

describe('minimum date of 2013-01-10 - date granularity', function () {
  'use strict';
  var $rootScope, element;
  beforeEach(module('ui.bootstrap.datetimepicker'));
  beforeEach(inject(function (_$compile_, _$rootScope_) {
    $rootScope = _$rootScope_;
    $rootScope.date = moment("2013-01-22T00:00:00.000").toDate();
    element = _$compile_('<datetimepicker data-datetimepicker-config="{ startView: \'day\', minDate: \'2013-01-10\'}" data-ng-model="date"></datetimepicker>')($rootScope);
    $rootScope.$digest();
  }));
  it('has 11 `.disabled` elements', function () {
    expect(jQuery('.disabled', element).length).toBe(11);
  });
  it('last `.disabled` element should be 2013-01-09', function () {
    expect(jQuery('.disabled', element).last().text()).toBe('9');
  });
});

describe('maximum date of 2013-01-26 - date granularity', function () {
  'use strict';
  var $rootScope, element;
  beforeEach(module('ui.bootstrap.datetimepicker'));
  beforeEach(inject(function (_$compile_, _$rootScope_) {
    $rootScope = _$rootScope_;
    $rootScope.date = moment("2013-01-22T00:00:00.000").toDate();
    element = _$compile_('<datetimepicker data-datetimepicker-config="{ startView: \'day\', maxDate: \'2013-01-26\'}" data-ng-model="date"></datetimepicker>')($rootScope);
    $rootScope.$digest();
  }));
  it('has 11 `.disabled` elements', function () {
    expect(jQuery('.disabled', element).length).toBe(14);
  });
  it('first `.disabled` element should be 2013-01-27', function () {
    expect(jQuery('.disabled', element).first().text()).toBe('27');
  });
});

describe('minimum date of 2013-06 - month granularity', function () {
  'use strict';
  var $rootScope, element;
  beforeEach(module('ui.bootstrap.datetimepicker'));
  beforeEach(inject(function (_$compile_, _$rootScope_) {
    $rootScope = _$rootScope_;
    $rootScope.date = moment("2013-01-22T00:00:00.000").toDate();
    element = _$compile_('<datetimepicker data-datetimepicker-config="{ startView: \'month\', minDate: \'2013-06\'}" data-ng-model="date"></datetimepicker>')($rootScope);
    $rootScope.$digest();
  }));
  it('has 11 `.disabled` elements', function () {
    expect(jQuery('.disabled', element).length).toBe(5);
  });
  it('last `.disabled` element should be May', function () {
    expect(jQuery('.disabled', element).last().text()).toBe('May');
  });
});

describe('maximum date of 2013-01-26 - month granularity', function () {
  'use strict';
  var $rootScope, element;
  beforeEach(module('ui.bootstrap.datetimepicker'));
  beforeEach(inject(function (_$compile_, _$rootScope_) {
    $rootScope = _$rootScope_;
    $rootScope.date = moment("2013-01-22T00:00:00.000").toDate();
    element = _$compile_('<datetimepicker data-datetimepicker-config="{ startView: \'month\', maxDate: \'2013-06\'}" data-ng-model="date"></datetimepicker>')($rootScope);
    $rootScope.$digest();
  }));
  it('has 11 `.disabled` elements', function () {
    expect(jQuery('.disabled', element).length).toBe(6);
  });
  it('first `.disabled` element should be Jul', function () {
    expect(jQuery('.disabled', element).first().text()).toBe('Jul');
  });
});

describe('minimum date of 2013 - year granularity', function () {
  'use strict';
  var $rootScope, element;
  beforeEach(module('ui.bootstrap.datetimepicker'));
  beforeEach(inject(function (_$compile_, _$rootScope_) {
    $rootScope = _$rootScope_;
    $rootScope.date = moment("2013-01-22T00:00:00.000").toDate();
    element = _$compile_('<datetimepicker data-datetimepicker-config="{ startView: \'year\', minDate: \'2013\'}" data-ng-model="date"></datetimepicker>')($rootScope);
    $rootScope.$digest();
  }));
  it('has 11 `.disabled` elements', function () {
    expect(jQuery('.disabled', element).length).toBe(4);
  });
  it('last `.disabled` element should be 2013-01-09', function () {
    expect(jQuery('.disabled', element).last().text()).toBe('2012');
  });
});

describe('maximum date of 2013 - year granularity', function () {
  'use strict';
  var $rootScope, element;
  beforeEach(module('ui.bootstrap.datetimepicker'));
  beforeEach(inject(function (_$compile_, _$rootScope_) {
    $rootScope = _$rootScope_;
    $rootScope.date = moment("2013-01-22T00:00:00.000").toDate();
    element = _$compile_('<datetimepicker data-datetimepicker-config="{ startView: \'year\', maxDate: \'2013\'}" data-ng-model="date"></datetimepicker>')($rootScope);
    $rootScope.$digest();
  }));
  it('has 11 `.disabled` elements', function () {
    expect(jQuery('.disabled', element).length).toBe(7);
  });
  it('first `.disabled` element should be 2013-01-27', function () {
    expect(jQuery('.disabled', element).first().text()).toBe('2014');
  });
});

describe('.past dates earlier than minDate are .disabled', function () {
  'use strict';
  var $rootScope, element;
  beforeEach(module('ui.bootstrap.datetimepicker'));
  beforeEach(inject(function (_$compile_, _$rootScope_) {
    $rootScope = _$rootScope_;
    $rootScope.date = moment("2013-01-22T00:00:00.000").toDate();
    element = _$compile_('<datetimepicker data-datetimepicker-config="{ startView: \'day\', minDate: \'2013-01-10\'}" data-ng-model="date"></datetimepicker>')($rootScope);
    $rootScope.$digest();
  }));
  it('has 0 .past:not(.disabled)', function () {
    expect(jQuery('.past:not(.disabled)', element).length).toBe(0);
  });
});

describe('.future dates later than maxDate are .disabled', function () {
  'use strict';
  var $rootScope, element;
  beforeEach(module('ui.bootstrap.datetimepicker'));
  beforeEach(inject(function (_$compile_, _$rootScope_) {
    $rootScope = _$rootScope_;
    $rootScope.date = moment("2013-01-22T00:00:00.000").toDate();
    element = _$compile_('<datetimepicker data-datetimepicker-config="{ startView: \'day\', maxDate: \'2013-01-26\'}" data-ng-model="date"></datetimepicker>')($rootScope);
    $rootScope.$digest();
  }));
  it('has 0 .future:not(.disabled)', function () {
    expect(jQuery('.future:not(.disabled)', element).length).toBe(0);
  });
});

describe('click on .disabled dates does nothing', function () {
  'use strict';
  var $rootScope, element;
  beforeEach(module('ui.bootstrap.datetimepicker'));
  beforeEach(inject(function (_$compile_, _$rootScope_) {
    $rootScope = _$rootScope_;
    $rootScope.date = moment("2013-01-22T00:00:00.000").toDate();
    element = _$compile_('<datetimepicker data-datetimepicker-config="{ startView: \'day\', minDate: \'2013-01-10\', maxDate: \'2013-01-26\'}" data-ng-model="date"></datetimepicker>')($rootScope);
    $rootScope.$digest();
  }));
  it('has 25 `.disabled` elements', function () {
    expect(jQuery('.disabled', element).length).toBe(25);
  });
  it('click on .past.disabled day does nothing', function () {
    jQuery('.past.disabled', element).last().trigger('click');
    expect(jQuery('.hour', element).length).toBe(0);
  });
  it('click on .future.disabled day does nothing', function () {
    jQuery('.future.disabled', element).last().trigger('click');
    expect(jQuery('.hour', element).length).toBe(0);
  });
  it('click on .disabled:not(.past):not(.future) day does nothing', function () {
    jQuery('.disabled:not(.past):not(.future)', element).last().trigger('click');
    expect(jQuery('.hour', element).length).toBe(0);
  });
});

describe('check valid min date', function () {
  'use strict';
  var $rootScope, $compile, element;
  beforeEach(module('ui.bootstrap.datetimepicker'));
  beforeEach(inject(function (_$compile_, _$rootScope_) {
    $compile = _$compile_;
    $rootScope = _$rootScope_;
    $rootScope.date = null;
  }));
  it('should throw error on bad date', function () {
    expect(function(){
      $rootScope.date = moment("2013-01-22T00:00:00.000").toDate();
      $compile('<datetimepicker data-datetimepicker-config="{ startView: \'day\', minDate: \'2013-01-99\', maxDate: \'2013-01-23\'}" data-ng-model="date"></datetimepicker>')($rootScope);
    }).toThrow('invalid minDate: 2013-01-99');
  });
  it('should default to new Date() when now', function(){
    $rootScope.date = moment().toDate();
	element = $compile('<datetimepicker data-datetimepicker-config="{ startView: \'day\', minDate: \'now\'}" data-ng-model="date"></datetimepicker>')($rootScope);
	$rootScope.$digest();
    expect(jQuery('td.day:not(.disabled):nth-child(1)', element).html()).toBe(''+moment().date());
  });
});

describe('check valid max date', function () {
  'use strict';
  var $rootScope, $compile, element;
  beforeEach(module('ui.bootstrap.datetimepicker'));
  beforeEach(inject(function (_$compile_, _$rootScope_) {
    $compile = _$compile_;
    $rootScope = _$rootScope_;
    $rootScope.date = null;
  }));
  it('should throw error on bad date', function () {
    expect(function(){
      $rootScope.date = moment("2013-01-22T00:00:00.000").toDate();
      $compile('<datetimepicker data-datetimepicker-config="{ startView: \'day\', minDate: \'2013-01-10\', maxDate: \'2013-01-99\'}" data-ng-model="date"></datetimepicker>')($rootScope);
    }).toThrow('invalid maxDate: 2013-01-99');
  });
  it('should default to new Date() when now', function(){
    $rootScope.date = moment().toDate();
	element = $compile('<datetimepicker data-datetimepicker-config="{ startView: \'day\', maxDate: \'now\'}" data-ng-model="date"></datetimepicker>')($rootScope);
	$rootScope.$digest();
    expect(jQuery('td.day:not(.disabled)', element).last().html()).toBe(''+moment().date());
  });
});