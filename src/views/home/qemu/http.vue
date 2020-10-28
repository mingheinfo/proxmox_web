<script>
export default {
  name: "QemuHttpIndex",
  methods: {
    deleteQemu() {
      let event = this.createEvent("qemu.action.delete", this.qemu.name);
      return this.$http
        .del(`/json/nodes/${this.qemu.node}/${this.qemu.id}`)
        .then(() => {
          window.localStorage.setItem("lastsel", "{}"),
            this.incEventSuccess(event);
          this.commitUpdateChangeTree(true);
        })
        .catch(() => {
          this.incEventFail(event);
        });
    },
    offQemu() {
      let event = this.createEvent(`action.qemu.off`, this.qemu.name);
      return this.$http
        .post(
          `/json/nodes/${this.qemu.node}/${this.qemu.id}/status/shutdown`,
          {},
          {
            headers: {
              "Content-Type":
                "application/x-www-form-urlencoded; charset=UTF-8",
            },
          }
        )
        .then(() => {
          this.incEventSuccess(event);
          this.queryResource();
        })
        .catch(() => {
          this.incEventFail(event);
        });
    },
    queryResource() {
      let last = window.localStorage.getItem("lastsel") || "[]";
      this.qemu = (JSON.parse(last) && JSON.parse(last)) || "";
      return this.$http
        .get(`/json/nodes/${this.qemu.node}/${this.qemu.id}/status/current`)
        .then((res) => {
					this.updateDbObject({
						name: 'qemuObj',
						data: res.data
					})
        });
    },
    pausedQemu(params) {
      let event = this.createEvent(
        `action.qemu.${params ? "suspend" : "paused"}`,
        this.qemu.name
      );
      return this.$http
        .post(
          `/json/nodes/${this.qemu.node}/${this.qemu.id}/status/suspend`,
          params,
          {
            headers: {
              "Content-Type":
                "application/x-www-form-urlencoded; charset=UTF-8",
            },
          }
        )
        .then(() => {
          this.incEventSuccess(event);
          this.queryResource();
        })
        .catch(() => {
          this.incEventSuccess(event);
        });
    },
    stopQemu() {
      let event = this.createEvent(`action.qemu.stop`, this.qemu.name);
      return this.$http
        .post(
          `/json/nodes/${this.qemu.node}/${this.qemu.id}/status/stop`,
          {
            timeout: 30,
          },
          {
            headers: {
              "Content-Type":
                "application/x-www-form-urlencoded; charset=UTF-8",
            },
          }
        )
        .then(() => {
          this.incEventSuccess(event);
          this.queryResource();
        })
        .catch(() => {
          this.incEventSuccess(event);
        });
    },
    resetQemu() {
      let event = this.createEvent(`action.qemu.reset`, this.qemu.name);
      return this.$http
        .post(
          `/json/nodes/${this.qemu.node}/${this.qemu.id}/status/reset`,
          {},
          {
            headers: {
              "Content-Type":
                "application/x-www-form-urlencoded; charset=UTF-8",
            },
          }
        )
        .then(() => {
          this.incEventSuccess(event);
          this.queryResource();
        })
        .catch(() => {
          this.incEventSuccess(event);
        });
    },
  },
};
</script>