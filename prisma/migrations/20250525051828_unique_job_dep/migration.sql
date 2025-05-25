/*
  Warnings:

  - A unique constraint covering the columns `[department_name]` on the table `Department` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[job_title_name]` on the table `JobTitle` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Department_department_name_key" ON "Department"("department_name");

-- CreateIndex
CREATE UNIQUE INDEX "JobTitle_job_title_name_key" ON "JobTitle"("job_title_name");
