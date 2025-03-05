<template>
  <div class="container mx-auto px-4 py-4 space-y-6">
    <div class="flex justify-between items-end">
      <h2 class="text-2xl font-semibold tracking-tight text-balance text-gray-950 sm:text-4xl">
        Чаты аккаунта, {{ account.user.userId }}
      </h2>

      <Button v-if="account.user.isLoading" disabled>
        <Loader2 class="w-4 h-4 mr-2 animate-spin" />
        Загрузка
      </Button>

      <Button v-else @click="account.logout()">Выйти</Button>
    </div>

    <div v-if="account.user?.rooms?.length" class="min-h-[40px] space-y-2">
      <div class="space-x-2">
        <Button @click="account.sorting('date')" variant="outline">
          Ивент
          <component
            :is="account.sortingTypes['date'] === 'desc' ? ArrowUpNarrowWide : ArrowDownWideNarrow"
            class="w-4 h-4"
          />
        </Button>
        <Button @click="account.sorting('alphabet')" variant="outline">
          Алфавит
          <component
            :is="
              account.sortingTypes['alphabet'] === 'desc' ? ArrowUpNarrowWide : ArrowDownWideNarrow
            "
            class="w-4 h-4"
          />
        </Button>
        <Button @click="account.sorting('unreadMessage')" variant="outline">
          Не прочитанные
          <component
            :is="
              account.sortingTypes['unreadMessage'] === 'desc'
                ? ArrowUpNarrowWide
                : ArrowDownWideNarrow
            "
            class="w-4 h-4"
          />
        </Button>
      </div>
      <div
        v-for="room in account.user.rooms"
        :key="room.roomId"
        class="flex flex-col items-start p-2 border rounded-md min-h-[50px]"
      >
        <div class="flex space-x-2">
          <p class="font-semibold">{{ room.name }}</p>
          <span class="flex items-center justify-center px-2 bg-red-100 rounded-full">
            {{ room.unreadCount }}
          </span>
        </div>
        <div class="flex w-full justify-between">
          <p>
            {{ room.lastMessage ? room.lastMessage : 'В этом чате нет не зашифрованых сообщений' }}
          </p>
          <p>
            {{ room.date ? dayjs(room.date).format('DD.MM.YYYY') : '' }}
          </p>
        </div>
      </div>
    </div>

    <div v-else class="space-y-4">
      <div v-for="item in 4" :key="item" class="flex flex-col items-start space-y-3">
        <div class="flex space-x-2">
          <Skeleton class="h-4 w-[250px]" />
          <Skeleton class="h-4 w-4 rounded-full" />
        </div>
        <Skeleton class="h-4 w-full max-w-[550px]" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useAccountStore } from '@/stores/account'
import { Loader2 } from 'lucide-vue-next'
import { ArrowUpNarrowWide, ArrowDownWideNarrow } from 'lucide-vue-next'
import dayjs from 'dayjs'

const account = useAccountStore()
</script>
