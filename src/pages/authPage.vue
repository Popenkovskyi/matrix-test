<template>
  <div class="flex justify-center items-center h-screen mx-auto max-w-md">
    <form class="w-2/3 space-y-4" @submit.prevent="onSubmit">
      <h1 class="text-3xl font-bold">Matrix Login</h1>

      <FormField v-slot="{ field, errors }" name="serverType">
        <FormItem>
          <FormLabel>Сервер</FormLabel>
          <Select v-bind="field">
            <SelectTrigger>
              <SelectValue placeholder="Выберите сервер" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem v-for="option in account.serverTypes" :key="option" :value="option">
                  {{ option }}
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <FormMessage>{{ errors }}</FormMessage>
        </FormItem>
      </FormField>

      <FormField v-slot="{ field, errors }" name="username">
        <FormItem>
          <FormLabel>Логин</FormLabel>
          <FormControl>
            <Input v-bind="field" type="text" placeholder="Введите логин" autocomplete="username" />
          </FormControl>
          <FormMessage>{{ errors[0] }}</FormMessage>
        </FormItem>
      </FormField>

      <FormField v-slot="{ field, errors }" name="password">
        <FormItem>
          <FormLabel>Пароль</FormLabel>
          <FormControl>
            <Input
              v-bind="field"
              type="password"
              placeholder="Введите пароль"
              autocomplete="current-password"
            />
          </FormControl>
          <FormMessage>{{ errors[0] }}</FormMessage>
        </FormItem>
      </FormField>

      <div v-if="account.user.error" class="text-red-600">Ошибка: {{ account.user.error }}</div>

      <Button v-if="account.user.isLoading" disabled>
        <Loader2 class="w-4 h-4 mr-2 animate-spin" />
        Загрузка
      </Button>

      <Button v-else type="submit"> Войти </Button>
    </form>
  </div>
</template>

<script setup>
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-vue-next'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'

import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import * as z from 'zod'

import { useAccountStore } from '@/stores/account'

const account = useAccountStore()

const formSchema = toTypedSchema(
  z.object({
    serverType: z.string().min(1, 'Выберите сервер'),
    username: z.string().min(3, 'Логин должен содержать минимум 3 символа'),
    password: z.string().min(6, 'Пароль должен содержать минимум 6 символов'),
  }),
)

const { handleSubmit } = useForm({
  validationSchema: formSchema,
})

const onSubmit = handleSubmit((values) => {
  account.login(values)
})
</script>
