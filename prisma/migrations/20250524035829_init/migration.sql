-- CreateEnum
CREATE TYPE "RoleEnum" AS ENUM ('super_admin', 'admin', 'user');

-- CreateTable
CREATE TABLE "User" (
    "user_id" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "email_address" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "AuthenLog" (
    "authenLog_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "lastLogin_date" TIMESTAMP(3) NOT NULL,
    "lastPassword_changeDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AuthenLog_pkey" PRIMARY KEY ("authenLog_id")
);

-- CreateTable
CREATE TABLE "MetaData" (
    "meta_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "is_admin" BOOLEAN NOT NULL DEFAULT false,
    "created_by_user_id" TEXT NOT NULL,
    "created_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_modified_by_user_id" TEXT NOT NULL,
    "last_modified_date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MetaData_pkey" PRIMARY KEY ("meta_id")
);

-- CreateTable
CREATE TABLE "Employee" (
    "employee_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "department_id" TEXT NOT NULL,
    "job_title_id" TEXT NOT NULL,

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("employee_id")
);

-- CreateTable
CREATE TABLE "Personal" (
    "personal_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "id_card" TEXT NOT NULL,
    "phone_number" TEXT NOT NULL,
    "date_of_birth" TIMESTAMP(3) NOT NULL,
    "gender" TEXT NOT NULL,

    CONSTRAINT "Personal_pkey" PRIMARY KEY ("personal_id")
);

-- CreateTable
CREATE TABLE "Department" (
    "department_id" TEXT NOT NULL,
    "department_name" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("department_id")
);

-- CreateTable
CREATE TABLE "JobTitle" (
    "job_title_id" TEXT NOT NULL,
    "job_title_name" TEXT NOT NULL,
    "job_description" TEXT NOT NULL,

    CONSTRAINT "JobTitle_pkey" PRIMARY KEY ("job_title_id")
);

-- CreateTable
CREATE TABLE "Role" (
    "role_id" TEXT NOT NULL,
    "role_name" "RoleEnum" NOT NULL DEFAULT 'user',
    "description" TEXT NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("role_id")
);

-- CreateTable
CREATE TABLE "UserRole" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "role_id" TEXT NOT NULL,

    CONSTRAINT "UserRole_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AuthenLog_user_id_key" ON "AuthenLog"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_user_id_key" ON "Employee"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "Personal_user_id_key" ON "Personal"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "Personal_id_card_key" ON "Personal"("id_card");

-- CreateIndex
CREATE UNIQUE INDEX "Personal_phone_number_key" ON "Personal"("phone_number");

-- CreateIndex
CREATE UNIQUE INDEX "Role_role_name_key" ON "Role"("role_name");

-- CreateIndex
CREATE UNIQUE INDEX "UserRole_user_id_role_id_key" ON "UserRole"("user_id", "role_id");

-- AddForeignKey
ALTER TABLE "AuthenLog" ADD CONSTRAINT "AuthenLog_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MetaData" ADD CONSTRAINT "MetaData_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MetaData" ADD CONSTRAINT "MetaData_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MetaData" ADD CONSTRAINT "MetaData_last_modified_by_user_id_fkey" FOREIGN KEY ("last_modified_by_user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "Department"("department_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_job_title_id_fkey" FOREIGN KEY ("job_title_id") REFERENCES "JobTitle"("job_title_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Personal" ADD CONSTRAINT "Personal_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "Role"("role_id") ON DELETE RESTRICT ON UPDATE CASCADE;
