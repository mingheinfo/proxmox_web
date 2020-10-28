<script>
  import { mapActions, mapMutations } from 'vuex';
  import EventController from '@src/components/toast/eventController';
  export default {
    name: "VuexMixins",
    methods: {
      ...mapActions({
        'updateDB': 'UPDATE_DB',
        'updateTable': 'UPDATE_TABLE',
        'updateSearchObj': 'UPDATE_SEARCHOBJ',
        'updateSelectView': 'UPDATE_SELECTVIEW',
        'destroyToast': 'DESTROY_TOAST',
        'createToast': 'CREATE_TOAST',
        'updateDbObject': 'UPDATE_DB_OBJECT',
        'updateToast': 'UPDATE_TOAST',
        'updateLastSelect': 'UPDATE_LAST_SELECT',
        'updateChangeTree': 'UPDATE_CHANGE_TREE'
      }),
      ...mapMutations({
        'commitUpateLastSelect': 'UPDATE_LAST_SELECT',
        'commitUpdateChangeTree': 'UPDATE_CHANGE_TREE',
        'commitUpdateTable': 'UPDATE_TABLE'
      }),
      createEvent: function (action, name, count, content, subType, resourceInfos) {
        return EventController.createEvent(action, name, count, content, subType, resourceInfos, this)
      },
      _eventFinished: function (_event) {
        return EventController._eventFinished(_event, this)
      },
      incEventSuccess: function (event) {
        return EventController.incEventSuccess(event, this)
      },
      setEventSuccess: function (event, content) {
        return EventController.setEventSuccess(event, content, this)
      },
      incEventFail: function (event) {
        return EventController.incEventFail(event, this)
      },
      setEventFail: function (event, content) {
        return EventController.setEventFail(event, content, this)
      },
      setEventFinished: function (event) {
        return EventController.setEventFinished(event, this)
      },
    },
    computed: {
      db() {
        return this.$store.state.db
      }
    }
  }
</script>
