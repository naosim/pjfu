import { assert, assertEquals } from "https://deno.land/std@0.79.0/testing/asserts.ts";
import { TaskLimitDate } from "../src/domain/domain.ts";


Deno.test("TaskLimitDate#textToDate", () => {
  var now = new Date('2020/11/1');
  var act = TaskLimitDate.textToDate('12/1', now);
  assertEquals(act.getTime(), new Date('2020/12/1').getTime());
})

Deno.test("TaskLimitDate#textToDate_上旬", () => {
  var now = new Date('2020/11/1');
  var act = TaskLimitDate.textToDate('12/上', now);
  assertEquals(act.getTime(), new Date('2020/12/10').getTime());
})

Deno.test("TaskLimitDate#textToDate_中旬", () => {
  var now = new Date('2020/11/1');
  var act = TaskLimitDate.textToDate('12/中', now);
  assertEquals(act.getTime(), new Date('2020/12/20').getTime());
})

Deno.test("TaskLimitDate#textToDate_末日", () => {
  var now = new Date('2020/11/1');
  var act = TaskLimitDate.textToDate('12/末', now);
  assertEquals(act.getTime(), new Date('2020/12/31').getTime());
})

Deno.test("TaskLimitDate#textToDate_1Q", () => {
  var now = new Date('2020/11/1');
  var act = TaskLimitDate.textToDate('FY20/1Q', now);
  assertEquals(act.getTime(), new Date('2020/6/30').getTime());
})

Deno.test("TaskLimitDate#textToDate_4Q", () => {
  var now = new Date('2020/11/1');
  var act = TaskLimitDate.textToDate('FY20/4Q', now);
  assertEquals(act.getTime(), new Date('2021/3/31').getTime());
})
